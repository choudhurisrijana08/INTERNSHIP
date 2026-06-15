# TODO - Admin Dashboard UI Redesign (UI/UX only)

- [ ] Inspect current `src/components/AdminPanel.jsx` dashboard tab to locate where to replace UI
- [ ] Implement derived analytics calculations from existing `productsList`, `ordersList`, `usersList` (no new fetches)
- [ ] Add Recharts charts (LineChart, PieChart/BarChart) using derived live data arrays
- [ ] Add skeleton loading states tied to existing `loading` flag
- [ ] Add empty states when lists are empty
- [ ] Add error handling UI without altering fetch logic
- [ ] Modernize styling for glassmorphism/clean admin cards inside `AdminPanel.jsx` (no backend changes)
- [ ] Ensure existing admin navigation + other tabs (products/orders/users) remain unchanged
- [ ] Verify build/run: `npm start`, login as admin@luxe.com, open Admin → Dashboard
