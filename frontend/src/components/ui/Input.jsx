export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white"
    />
  );
}