export default function Input({
  type,
  id,
  required,
  onChange,
  min,
  step,
  accept,
  ariaDescribedby,
  ariaDescribedbyText,
  title,
  placeholder,
  value,
  labelClass,
  inputClass,
  ariaDescribedbyClass
}) {
  return (
    <div className="mb-6">
      <label
        className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${labelClass}`}
        htmlFor={id}
      >
        {title}
      </label>
      <input
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700
          dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
           dark:focus:ring-blue-500 dark:focus:border-blue-500 ${inputClass}`}
        type={type}
        id={id}
        required={required}
        onChange={onChange}
        min={min}
        step={step}
        accept={accept}
        aria-describedby={ariaDescribedby}
        placeholder={placeholder}
        value={value}
      />
      <div
        id={ariaDescribedby}
        className={`mt-1 text-sm text-gray-500 dark:text-gray-300 ${ariaDescribedbyClass}`}
      >
        {ariaDescribedbyText}
      </div>
    </div>
  )
}
