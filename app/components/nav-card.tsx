import { Link } from "@remix-run/react";
import { useAtom } from "jotai";
import { CardProps } from "~/libs/card-props";
import { favitoreListAtom } from "~/utils/favitore_list_atom";

interface NavCardProps {
  props: CardProps;
}

export default function NavCard({ props }: NavCardProps) {
  const [favitoreList, setFavitoreList] = useAtom(favitoreListAtom);

  const { title, imageUrl, description, url, id } = props;

  function changeFavitore(event: any) {
    event.stopPropagation();
    event.preventDefault();

    if (!favitoreList) {
      setFavitoreList([{ ...props }]);
    } else {
      if (favitoreList.findIndex((x) => x.id === id) !== -1) {
        setFavitoreList(favitoreList.filter((r) => r.id !== id));
      } else {
        setFavitoreList([...favitoreList, { ...props }]);
      }
    }
  }

  return (
    <a
      className="group transition-transform duration-300 ease-in-out hover:-translate-y-1"
      href={url}
      target="_blank"
    >
      <div
        className="bg-white dark:bg-gray-700 rounded overflow-hidden flex flex-col min-h-20 w-full shadow
       hover:shadow-lg cursor-pointer px-2 dark:shadow-gray-4
      hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 transition duration-300
      dark:text-gray-200
      dark:hover:ring-blue-400
      "
      >
        <div className="my-auto">
          <div className="flex justify-between">
            <div className="flex mb-2">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  loading="lazy"
                  className="w-8 h-8 object-cover my-auto"
                />
              )}
              <div className="flex overflow-hidden ml-2">
                <h3 className="font-bold text-sm truncate my-auto ml-2 dark:text-gray-300/80">
                  {title}
                </h3>
                {/* <p className="text-gray-700 text-sm line-clamp-2">{description}</p> */}
              </div>
            </div>

            <div className="my-auto">
              <svg
                onClick={(event) => changeFavitore(event)}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className={`size-6  hover:fill-current stroke-none 
          ${
            favitoreList && favitoreList.findIndex((r) => r.id === id) !== -1
              ? "fill-red-500 hover:text-gray-400/60"
              : "fill-gray-300/80  hover:text-red-400/80"
          }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>
          </div>

          <div className="w-full">
            <p className="text-gray-700 text-xs line-clamp-2 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
