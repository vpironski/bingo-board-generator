# Skill: Add a New View

## Steps
1. Create `src/views/NewView.jsx` — no business logic, hooks only
2. Add route in `App.jsx` using React Router v6 `<Route>` syntax
3. Add navigation link in the bottom nav component
4. Add a corresponding entry in the error boundary wrapper in App.jsx

## Template
\```jsx
export default function NewView() {
return (
<div className="flex flex-col h-full px-4 pt-6 pb-24">
{/* content */}
</div>
);
}
\```

## Rules
- `pb-24` on root div always — accounts for iPhone home indicator and bottom nav
- Never fetch data directly in a view — use a hook