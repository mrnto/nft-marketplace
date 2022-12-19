import Button from "./Button";

export default function Card({
  name,
  description,
  image,
  seller,
  price,
  buttonText,
  onClick,
  disabled
}) {
  return (
    <li className="w-full lg:w-1/4 xl:w-1/5 p-1.5">
      <div className="block bg-zinc-800 rounded-md w-full overflow-hidden pb-4 shadow-lg">
        <div
          className="w-full h-40 bg-center bg-cover relative"
          style={{ backgroundImage: `url(${image})` }}
        >
          {price &&
            <div
              className="absolute left-2 bottom-2 w-3/7 bg-white
                rounded-md bg-opacity-30 backdrop-blur-md"
            >
              <div className="p-1">
                <div>{price} ETH</div>
              </div>
            </div>
          }
        </div>
        <h3 className="font-semibold text-lg px-3 mt-2">
          {name}
        </h3>
        <span className="text-zinc-400 px-3 mt-2">
          {seller}
        </span>
        <div className="px-3 mt-2">
          {description}
        </div>
        <div className="flex justify-center	mt-2">
          <div className="p-3 w-7/12">
            <Button
              className={`h-12`}
              text={buttonText}
              onClick={onClick}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </li>
  )
}
