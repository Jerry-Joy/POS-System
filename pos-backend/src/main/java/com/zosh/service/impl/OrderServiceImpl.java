package com.zosh.service.impl;


import com.zosh.domain.OrderStatus;
import com.zosh.domain.PaymentType;
import com.zosh.exception.UserException;
import com.zosh.mapper.OrderMapper;
import com.zosh.modal.*;
import com.zosh.payload.dto.OrderDTO;
import com.zosh.repository.*;

import com.zosh.service.OrderService;
import com.zosh.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final UserService userService;
    private final InventoryRepository inventoryRepository;
    private final CustomerRepository customerRepository;

    @Override
    public OrderDTO createOrder(OrderDTO dto) throws UserException {
        User cashier = userService.getCurrentUser();

        Branch branch=cashier.getBranch();

        if(branch==null){
            throw new UserException("cashier's branch is null");
        }

        Order order = Order.builder()
                .branch(branch)
                .cashier(cashier)
                .customer(dto.getCustomer())
                .paymentType(dto.getPaymentType())
                .build();

        List<OrderItem> orderItems = dto.getItems().stream().map(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            // ✅ Check and update inventory
            Inventory inventory = inventoryRepository.findByBranchIdAndProductId(branch.getId(), product.getId());
            if (inventory == null) {
                throw new EntityNotFoundException("Inventory not found for product: " + product.getName() + " in branch: " + branch.getName());
            }

            if (inventory.getQuantity() < itemDto.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName() + 
                    ". Available: " + inventory.getQuantity() + ", Requested: " + itemDto.getQuantity());
            }

            // ✅ Deduct quantity from inventory
            inventory.setQuantity(inventory.getQuantity() - itemDto.getQuantity());
            inventoryRepository.save(inventory);

            return OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getSellingPrice() * itemDto.getQuantity())
                    .order(order)

                    .build();
        }).toList();

        double itemsSubtotal = orderItems.stream().mapToDouble(OrderItem::getPrice).sum();
        
        // Set order financial details
        order.setSubtotal(dto.getSubtotal() != null ? dto.getSubtotal() : itemsSubtotal);
        order.setTax(dto.getTax() != null ? dto.getTax() : 0.0);
        order.setDiscount(dto.getDiscount() != null ? dto.getDiscount() : 0.0);
        order.setLoyaltyPointsUsed(dto.getLoyaltyPointsUsed() != null ? dto.getLoyaltyPointsUsed() : 0);
        // Total = Subtotal + Tax - Discount
        order.setTotalAmount(order.getSubtotal() + order.getTax() - order.getDiscount());
        order.setItems(orderItems);

        // ✅ Award loyalty points to customer (if customer exists)
        if (dto.getCustomer() != null && dto.getCustomer().getId() != null) {
            try {
                Customer customer = customerRepository.findById(dto.getCustomer().getId())
                        .orElse(null);
                if (customer != null) {
                    // Calculate points: 1 point per $1 spent (rounded down) - based on amount AFTER discount
                    Integer pointsToAdd = (int) Math.floor(order.getTotalAmount());
                    customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsToAdd);
                    customerRepository.save(customer);
                    System.out.println("✅ Awarded " + pointsToAdd + " loyalty points to customer: " + customer.getFullName());
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to award loyalty points: " + e.getMessage());
                // Don't fail the order if loyalty points update fails
            }
        }

        return OrderMapper.toDto(orderRepository.save(order));
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(OrderMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
    }



    @Override
    public List<OrderDTO> getOrdersByBranch(Long branchId,
                                            Long customerId,
                                            Long cashierId,
                                            PaymentType paymentType,
                                            OrderStatus status) {
        return orderRepository.findByBranchId(branchId).stream()

                // ✅ Filter by Customer ID (if provided)
                .filter(order -> customerId == null ||
                        (order.getCustomer() != null &&
                                order.getCustomer().getId().equals(customerId)))

                // ✅ Filter by Cashier ID (if provided)
                .filter(order -> cashierId==null ||
                        (order.getCashier() != null &&
                                order.getCashier().getId().equals(cashierId)))

                // ✅ Filter by Payment Type (if provided)
                .filter(order -> paymentType == null ||
                        order.getPaymentType() == paymentType)

                // ✅ Filter by Status (if provided)
//                .filter(order -> status() == null ||
//                        order.getStatus() == status)

                // ✅ Map to DTO
                .map(OrderMapper::toDto)

                // ✅ Sort by createdAt (latest first)
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))

                .collect(Collectors.toList());
//        return orderRepository.findByBranchId(branchId).stream()
//                .map(OrderMapper::toDto)
//                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCashier(Long cashierId) {
        return orderRepository.findByCashierId(cashierId).stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found");
        }
        orderRepository.deleteById(id);
    }

    @Override
    public List<OrderDTO> getTodayOrdersByBranch(Long branchId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return orderRepository.findByBranchIdAndCreatedAtBetween(branchId, start, end)
                .stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);

        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getTop5RecentOrdersByBranchId(Long branchId) {
        branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));

        List<Order> orders = orderRepository.findTop5ByBranchIdOrderByCreatedAtDesc(branchId);
        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

}
