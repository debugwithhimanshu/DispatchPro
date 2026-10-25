"""
DispatchPro - Core Logic
========================
- Depot: (0,0)
- Distance: Manhattan distance (|x1-x2| + |y1-y2|)
- 2 riders, route must return to depot
- Service time: 2 minutes per stop
- Late if arrival > window_end
- Early arrival waits until window_start
"""

from itertools import permutations, product

# STOPS format: "STOP_ID": (x, y, packages, window_start, window_end)
STOPS = {
    "D1": (1, 2, 1, "09:00", "11:00"),
    "D2": (4, 2, 1, "09:00", "10:30"),
    "D3": (5, 5, 2, "10:00", "12:00"),
    "D4": (2, 6, 1, "09:30", "11:30"),
    "D5": (7, 1, 1, "09:00", "10:00"),
    "D6": (3, 4, 1, "10:00", "12:00"),
}


def time_to_mins(t):
    """Convert HH:MM to minutes since midnight"""
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def mins_to_time(m):
    """Convert minutes to HH:MM"""
    h = m // 60
    mm = m % 60
    return f"{h:02d}:{mm:02d}"


def manhattan_dist(a, b):
    """Calculate Manhattan distance between (x,y) points"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def evaluate_route(route, depart="09:00"):
    """
    Evaluate a single route
    Returns: (total_distance_including_return, list_of_late_stops)
    late_stops format: [(stop_id, minutes_late), ...]
    """
    current_pos = (0, 0)
    current_time = time_to_mins(depart)
    total_dist = 0
    late_list = []
    
    for stop_id in route:
        if stop_id not in STOPS:
            continue
        x, y, pkgs, window_start, window_end = STOPS[stop_id]
        stop_pos = (x, y)
        
        # Travel to stop
        travel_dist = manhattan_dist(current_pos, stop_pos)
        total_dist += travel_dist
        current_time += travel_dist
        
        # Wait if arrive early
        ws_mins = time_to_mins(window_start)
        we_mins = time_to_mins(window_end)
        if current_time < ws_mins:
            current_time = ws_mins
        
        # Check if late
        if current_time > we_mins:
            late_by = current_time - we_mins
            late_list.append((stop_id, late_by))
        
        # Service time
        current_time += 2
        current_pos = stop_pos
    
    # Return to depot
    total_dist += manhattan_dist(current_pos, (0, 0))
    
    return total_dist, late_list


# Keep old names for backward compatibility
mins = time_to_mins
dist = manhattan_dist
evaluate = evaluate_route


def optimize_routes(capacity=4, depart="09:00"):
    """
    Brute force optimization for 2 riders
    Assigns each stop to rider 1, rider 2, or unassigned
    For each rider, tries all permutations of stops
    Ranking: (unassigned_packages, number_of_late_stops, total_distance)
    """
    stop_ids = list(STOPS.keys())
    best_solution = None
    
    # Try all assignments: 0=rider1, 1=rider2, None=unassigned
    for assignment in product([0, 1, None], repeat=len(stop_ids)):
        # Group stops by rider
        rider1_stops = []
        rider2_stops = []
        for stop_id, rider in zip(stop_ids, assignment):
            if rider == 0:
                rider1_stops.append(stop_id)
            elif rider == 1:
                rider2_stops.append(stop_id)
        
        # Check capacity
        load1 = sum(STOPS[s][2] for s in rider1_stops)
        load2 = sum(STOPS[s][2] for s in rider2_stops)
        if load1 > capacity or load2 > capacity:
            continue
        
        # Find unassigned
        unassigned = []
        for stop_id, rider in zip(stop_ids, assignment):
            if rider is None:
                unassigned.append(stop_id)
        unassigned_pkgs = sum(STOPS[s][2] for s in unassigned)
        
        # Optimize order for each rider (try all permutations)
        routes = []
        total_dist = 0
        total_late = 0
        
        for group in [rider1_stops, rider2_stops]:
            if not group:
                routes.append([])
                continue
            # Find best order for this group
            best_order = None
            best_order_key = None
            for perm in permutations(group):
                dist_r, late_r = evaluate_route(perm, depart)
                key = (len(late_r), dist_r)
                if best_order_key is None or key < best_order_key:
                    best_order_key = key
                    best_order = perm
            
            dist_r, late_r = evaluate_route(best_order, depart)
            routes.append(best_order)
            total_dist += dist_r
            total_late += len(late_r)
        
        # Compare solutions
        solution_key = (unassigned_pkgs, total_late, total_dist)
        if best_solution is None or solution_key < best_solution[0]:
            best_solution = (solution_key, routes, unassigned)
    
    if best_solution is None:
        return [[], []], list(STOPS.keys())
    
    return best_solution[1], best_solution[2]


# Keep old name for backward compatibility
optimize = optimize_routes


def display_solution(title, routes, unassigned, depart="09:00"):
    """Display route solution in readable format"""
    print(f"\n== {title} ==")
    grand_total = 0
    
    for i, route in enumerate(routes, 1):
        if not route:
            print(f"Rider {i}: - | distance 0 | flags: none")
            continue
        dist_r, late_r = evaluate_route(route, depart)
        grand_total += dist_r
        load = sum(STOPS[s][2] for s in route)
        flags = ", ".join(f"{s} LATE by {m} min" for s, m in late_r) or "none"
        route_str = " -> ".join(route)
        print(f"Rider {i}: {route_str} | load {load} | distance {dist_r} | flags: {flags}")
    
    if unassigned:
        print(f"UNASSIGNED: {', '.join(unassigned)}")
    
    print(f"Total distance: {grand_total}")
    return grand_total


# Keep old name for backward compatibility
show = display_solution


if __name__ == "__main__":
    print("Running DispatchPro tests...\n")
    
    # Test 1 & 2: Baseline vs Optimized
    base = display_solution("Baseline", [("D1", "D2", "D3"), ("D4", "D5", "D6")], [])
    routes_opt, un_opt = optimize_routes()
    opt = display_solution("Optimized", routes_opt, un_opt)
    improvement = (base - opt) / base * 100
    print(f"\nImprovement: {improvement:.1f}%")
    
    assert base == 52, f"Baseline should be 52, got {base}"
    assert opt == 40, f"Optimized should be 40, got {opt}"
    
    # Test 3: Late detection
    _, late = evaluate_route(("D5", "D2", "D1"), "09:55")
    assert late == [("D5", 3)], f"Expected D5 late by 3, got {late}"
    
    # Test 4 & 5: Capacity constraints
    routes_c3, un_c3 = optimize_routes(capacity=3)
    display_solution("Scenario C (capacity 3)", routes_c3, un_c3)
    assert un_c3, "Should have unassigned when capacity is 3"
    for r in routes_c3:
        load = sum(STOPS[s][2] for s in r)
        assert load <= 3, f"Rider load {load} exceeds capacity 3"
    
    print("\n[OK] All tests passed successfully!")
