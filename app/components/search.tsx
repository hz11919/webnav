import { Link } from "@remix-run/react";
import Fuse from "fuse.js";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDebounce } from "~/hooks/use-debounce";
import { CardProps } from "~/libs/card-props";

interface ISearchProps {
  list: CardProps[];
}

export default function Search({ list }: ISearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [resultList, setResultList] = useState<CardProps[]>([]);

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleEsc = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        clear();
      }
    };

    window.addEventListener("keydown", handleEsc);

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("blur", handleBlur);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus);
        inputElement.removeEventListener("blur", handleBlur);
      }

      window.removeEventListener("keydown", handleEsc);
    };
  }, []);


  useEffect(() => {
    function handleKeyDown(e: any) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : resultList.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < resultList.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case 'Enter':
          let current = resultList[selectedIndex];
          if (current) {
            clear();
            window.open(current.url, '_blank', 'noopener,noreferrer');
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resultList, selectedIndex]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const fuse = useMemo(
    () =>
      new Fuse(list, {
        keys: ["title", "description"],
        threshold: 0.3,
        includeMatches: true,
      }),
    [list]
  );

  useEffect(() => {
    setIsSearching(true);
    if (debouncedSearchTerm) {
      const results = fuse
        .search(debouncedSearchTerm)
        .map((result) => result.item);

      setResultList(results);
    } else {
      setSelectedIndex(-1);
      setResultList([]);
    }

    setIsSearching(false);
  }, [debouncedSearchTerm]);

  function clear() {
    setSelectedIndex(-1);
    setSearchTerm("");
    setIsSearching(false);
    setResultList([]);
  }

  return (
    <div className="relative m-auto w-[80%] lg:w-1/3">
      <div>
        <label htmlFor="Search" className="sr-only">
          {" "}
          Search{" "}
        </label>

        <input
          ref={inputRef}
          type="text"
          id="Search"
          placeholder="搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border pl-10 rounded-md text-xs lg:text-sm border-gray-300 focus:border-blue focus:ring-1 focus:outline-none
         dark:bg-gray-700 dark:text-gray-300  dark:border-gray-700 py-2.5 pe-10 shadow-sm sm:text-sm"
        />

        <span className="absolute inset-y-0 start-0 grid w-10 place-content-center">
          <span
            className="text-gray-600 hover:text-gray-700
         dark:text-gray-300 dark:hover:text-gray-200"
          >
            <span className="sr-only">Search</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4 text-gray-600 dark:text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>
        </span>

        {Boolean(searchTerm) && (
          <span className="absolute inset-y-0 end-2 grid w-10 place-content-center">
            <button
              type="button"
              className="text-gray-600 dark:text-gray-300"
              onClick={() => setSearchTerm("")}
            >
              <span className="sr-only">Clear</span>
              <span className="flex">
                <span className="text-xs text-gray-400/80">esc</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4 my-auto text-gray-500"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </span>
            </button>
          </span>
        )}
      </div>

      <div className="absolute top-11 rounded-sm left-0 w-full h-auto max-h-72 bg-gray-200/80 z-20 overflow-y-auto px-2
      dark:bg-slate-500">
        {(isFocused || Boolean(resultList.length)) &&
          (Boolean(resultList.length) ? (
            <ul className="">
              {resultList.map((item, index) => {
                return (
                  <li
                  ref={el => itemRefs.current[index] = el}
                    key={index}
                    className={`w-full px-2 my-2   dark:text-gray-300 h-10 flex justify-between cursor-pointer
                     hover:bg-blue-200/60 dark:hover:bg-blue-300/60
                    ${selectedIndex === index ? 'bg-blue-100/80 dark:bg-blue-500/40 ' : 'bg-gray-100 dark:bg-gray-700'}`}
                  >
                    <a
                      onClick={() => clear()}
                      href={item.url}
                      className="flex justify-between w-full"
                      target="_blank"
                    >
                      <div className="flex  gap-x-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-4 h-4 object-cover my-auto"
                        />
                        <span className="my-auto text-xs">{item.title}</span>
                      </div>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5 my-auto text-gray-500/80 dark:text-gray-300"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            Boolean(searchTerm) && (
              <div className="h-10 mx-auto flex justify-center mt-4">
                <span className="text-sm text-gray-400/60 text-center">
                  {isSearching ? "正在搜索中..." : "暂无结果"}
                </span>
              </div>
            )
          ))}
      </div>
    </div>
  );
}
