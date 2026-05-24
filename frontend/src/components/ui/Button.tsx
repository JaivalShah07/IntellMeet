// @ts-nocheck
export default function Button({ children, onClick, variant = "primary" }) {
  const base =
    "px-4 py-2 rounded font-medium transition";

  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "bg-gray-200 dark:bg-gray-700 text-black dark:text-white",
    danger:
      "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}
