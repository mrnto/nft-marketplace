export default function Button({
  className,
  text,
  onClick,
  disabled,
  type
}) {
  return (
    <button
      className={`bg-gradient-to-tr from-fuchsia-600
        to-violet-600 w-full rounded-md font-semibold
        disabled:from-fuchsia-800 disabled:to-violet-800 ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {text}
    </button>
  )
}
