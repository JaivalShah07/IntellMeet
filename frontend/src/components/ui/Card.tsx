// @ts-nocheck
export default function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow">
      {children}
    </div>
  );
}
