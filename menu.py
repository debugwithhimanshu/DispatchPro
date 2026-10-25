"""
DispatchPro - Interactive Menu
"""
import dispatch as d

# Settings
capacity = 4
depart_time = "09:00"

# Baseline routes
BASE_ROUTES = [("D1", "D2", "D3"), ("D4", "D5", "D6")]


def show_stops():
    """Display all stops with details"""
    print("\n" + "="*50)
    print(f"{'Stop':<6} {'X':<4} {'Y':<4} {'Pkgs':<6} {'Window':<12}")
    print("="*50)
    for stop_id, (x, y, pkgs, ws, we) in d.STOPS.items():
        print(f"{stop_id:<6} {x:<4} {y:<4} {pkgs:<6} {ws}-{we:<8}")
    print("="*50)
    print(f"Capacity: {capacity} | Departure: {depart_time}")


def report_routes(routes, unassigned, title):
    """Display route report with load, distance, late flags"""
    print(f"\n== {title} ==")
    grand_total = 0
    
    for i, route in enumerate(routes, 1):
        if not route:
            print(f"Rider {i}: - | load 0/{capacity} | distance 0 | flags: none")
            continue
        
        dist_r, late_r = d.evaluate_route(route, depart_time)
        grand_total += dist_r
        load = sum(d.STOPS[s][2] for s in route)
        
        flags = []
        for s, late_min in late_r:
            flags.append(f"{s} LATE by {late_min} min")
        if load > capacity:
            flags.append(f"CAPACITY EXCEEDED ({load}/{capacity})")
        
        route_str = " -> ".join(route)
        flags_str = ", ".join(flags) if flags else "none"
        print(f"Rider {i}: {route_str} | load {load}/{capacity} | distance {dist_r} | flags: {flags_str}")
    
    if unassigned:
        print(f"UNASSIGNED: {', '.join(unassigned)}")
    
    print(f"Total distance: {grand_total}")
    return grand_total


def parse_stops(text):
    """Parse stop IDs from input"""
    # Replace commas with spaces and split
    text = text.replace(",", " ")
    stops = text.strip().upper().split()
    return stops


def custom_assignment():
    """Manually assign stops to riders"""
    show_stops()
    print("\nStops enter karo (jaise: D1 D2 D5)")
    print("(Khali chhod do agar koi stop nahi assign karna)")
    
    try:
        r1_input = input("\nRider 1: ")
        r2_input = input("Rider 2: ")
    except EOFError:
        return
    
    rider1 = parse_stops(r1_input)
    rider2 = parse_stops(r2_input)
    all_assigned = rider1 + rider2
    
    # Check for invalid stops
    invalid = [s for s in all_assigned if s not in d.STOPS]
    if invalid:
        print(f"Galat stop ID: {invalid}")
        return
    
    # Check for duplicates
    duplicates = []
    for s in all_assigned:
        if all_assigned.count(s) > 1 and s not in duplicates:
            duplicates.append(s)
    if duplicates:
        print(f"Ye stops do baar assign hue: {sorted(duplicates)}")
        return
    
    # Find unassigned
    unassigned = [s for s in d.STOPS.keys() if s not in all_assigned]
    
    # Report
    tot = report_routes([tuple(r1) for r1 in [rider1], tuple(rider2)], unassigned, "Custom Assignment")
    
    if unassigned:
        print("\nNOTE: Kuch stops unassigned hain, isliye baseline se compare nahi kar sakte.")
    else:
        # Compare with baseline
        base_tot = sum(d.evaluate_route(r, depart_time)[0] for r in BASE_ROUTES)
        if base_tot > 0:
            improvement = (base_tot - tot) / base_tot * 100
            print(f"Baseline ({base_tot}) se improvement: {improvement:.1f}%")


def add_edit_stop():
    """Add or edit a stop"""
    try:
        stop_id = input("Stop ID (jaise D1 ya D7): ").upper().strip()
        print(f"\nStop {stop_id} ka data enter karo:")
        x = int(input("X coordinate: "))
        y = int(input("Y coordinate: "))
        pkgs = int(input("Packages: "))
        ws = input("Window start (HH:MM): ").strip()
        we = input("Window end (HH:MM): ").strip()
        
        # Validate time
        d.time_to_mins(ws)
        d.time_to_mins(we)
        
        d.STOPS[stop_id] = (x, y, pkgs, ws, we)
        print(f"\n✓ Stop {stop_id} save ho gaya!")
        
    except ValueError:
        print("\n✗ Galat input! Numbers aur sahi time format use karo.")
    except Exception as e:
        print(f"\n✗ Error: {e}")


def remove_stop():
    """Remove a stop"""
    try:
        stop_id = input("Hatane wala Stop ID: ").upper().strip()
        if stop_id in d.STOPS:
            del d.STOPS[stop_id]
            print(f"\n✓ Stop {stop_id} hata diya gaya.")
            print("Optimize dobara chalana hoga (Option 3)")
        else:
            print("\n✗ Stop nahi mila.")
    except EOFError:
        return


def run_optimize():
    """Run optimization"""
    if len(d.STOPS) > 9:
        print("\n✗ Warning: 9 se zyada stops pe brute force slow ho sakta hai.")
        confirm = input("Phir bhi chalana chahte ho? (y/n): ").lower()
        if confirm != 'y':
            return
    
    print("\nOptimizing... (thoda time lag sakta hai)")
    routes, unassigned = d.optimize_routes(capacity, depart_time)
    report_routes(routes, unassigned, "Optimized Routes")


def menu():
    """Main menu"""
    global capacity, depart_time
    
    print("\n" + "="*40)
    print("  DISPATCHPRO - Route Optimizer")
    print("="*40)
    
    while True:
        print("""
1. Stops dikhao
2. Baseline routes
3. Optimize (Auto assign)
4. Custom assign (khud routes do)
5. Stop add/edit
6. Stop hatao
7. Capacity badlo
8. Departure time badlo
9. Scenario B demo (Late delivery)
10. Scenario C demo (Capacity 3)
0. Exit
""")
        try:
            choice = input("Choice select karo: ").strip()
        except EOFError:
            break
        
        if choice == "1":
            show_stops()
        
        elif choice == "2":
            report_routes(list(BASE_ROUTES), [], "Baseline Routes")
        
        elif choice == "3":
            run_optimize()
        
        elif choice == "4":
            custom_assignment()
        
        elif choice == "5":
            add_edit_stop()
        
        elif choice == "6":
            remove_stop()
        
        elif choice == "7":
            try:
                new_cap = input(f"Current capacity: {capacity}\nNaya capacity: ").strip()
                capacity = int(new_cap)
                print(f"\n✓ Capacity {capacity} set ho gaya")
            except ValueError:
                print("\n✗ Sahi number enter karo")
            except EOFError:
                pass
        
        elif choice == "8":
            try:
                new_time = input(f"Current departure: {depart_time}\nNaya time (HH:MM): ").strip()
                # Validate
                d.time_to_mins(new_time)
                depart_time = new_time
                print(f"\n✓ Departure time {depart_time} set ho gaya")
            except ValueError:
                print("\n✗ Galat time format (HH:MM use karo)")
            except EOFError:
                pass
        
        elif choice == "9":
            # Scenario B: depart late
            old_time = depart_time
            depart_time = "09:55"
            print("\nScenario B: Departure 09:55, Route D5 -> D2 -> D1")
            report_routes([("D5", "D2", "D1"), ()], [], "Scenario B")
            depart_time = old_time
        
        elif choice == "10":
            # Scenario C: capacity 3
            old_cap = capacity
            capacity = 3
            print("\nScenario C: Capacity = 3")
            routes_c, un_c = d.optimize_routes(capacity, depart_time)
            report_routes(routes_c, un_c, "Scenario C")
            capacity = old_cap
        
        elif choice == "0":
            print("\nBye! 👋")
            break
        
        else:
            print("\n✗ Galat choice, dobara try karo")


if __name__ == "__main__":
    menu()
