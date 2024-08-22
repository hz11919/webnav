import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, createCookieSessionStorage, json, redirect } from "@remix-run/node";
import { RemixServer, useFetcher, useLoaderData, Meta, Links, ScrollRestoration, Scripts } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import clsx from "clsx";
import { createContext, useState, useRef, useEffect, useContext, createElement, useMemo, Suspense } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { HeartIcon, FireIcon, FaceSmileIcon, PlayCircleIcon, SparklesIcon, BookOpenIcon, Bars3BottomLeftIcon, WindowIcon, ViewColumnsIcon, WrenchIcon, TicketIcon } from "@heroicons/react/24/outline";
import Fuse from "fuse.js";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
var Theme = /* @__PURE__ */ ((Theme2) => {
  Theme2["DARK"] = "dark";
  Theme2["LIGHT"] = "light";
  return Theme2;
})(Theme || {});
const themes = Object.values(Theme);
const ThemeContext = createContext(void 0);
const prefersDarkMQ = "(prefers-color-scheme: dark)";
const getPreferredTheme = () => window.matchMedia(prefersDarkMQ).matches ? "dark" : "light";
function ThemeProvider({
  children,
  specifiedTheme
}) {
  const [theme, setTheme] = useState(() => {
    if (specifiedTheme) {
      if (themes.includes(specifiedTheme)) {
        return specifiedTheme;
      } else {
        return null;
      }
    }
    if (typeof document === "undefined") {
      return null;
    }
    return getPreferredTheme();
  });
  const persistTheme = useFetcher();
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);
  const mountRun = useRef(false);
  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) {
      return;
    }
    persistThemeRef.current.submit(
      { theme },
      { action: "action/set-theme", method: "post" }
    );
  }, [theme]);
  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersDarkMQ);
    const handleChange = () => {
      setTheme(
        mediaQuery.matches ? "dark" : "light"
        /* LIGHT */
      );
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: [theme, setTheme], children });
}
`;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
    ? 'dark'
    : 'light';
  const darkEls = document.querySelectorAll("dark-mode");
  const lightEls = document.querySelectorAll("light-mode");
  for (const darkEl of darkEls) {
    if (theme === "dark") {
      for (const child of darkEl.childNodes) {
        darkEl.parentElement?.append(child);
      }
    }
    darkEl.remove();
  }
  for (const lightEl of lightEls) {
    if (theme === "light") {
      for (const child of lightEl.childNodes) {
        lightEl.parentElement?.append(child);
      }
    }
    lightEl.remove();
  }
})();`;
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
function Themed({
  dark,
  light,
  initialOnly = false
}) {
  const [theme] = useTheme();
  const [initialTheme] = useState(theme);
  const themeToReference = initialOnly ? initialTheme : theme;
  const serverRenderWithUnknownTheme = !theme && typeof document === "undefined";
  if (serverRenderWithUnknownTheme) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      createElement("dark-mode", null, dark),
      createElement("light-mode", null, light)
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: themeToReference === "light" ? light : dark });
}
function isTheme(value) {
  return typeof value === "string" && themes.includes(value);
}
const stylesheet = "/assets/tailwind-ii0AH13x.css";
function ThemeModeToggle() {
  const [, setTheme] = useTheme();
  const toggleTheme = () => {
    setTheme(
      (prevTheme) => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Themed,
    {
      dark: /* @__PURE__ */ jsx(
        "svg",
        {
          onClick: toggleTheme,
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          strokeWidth: 1.5,
          stroke: "currentColor",
          className: "size-5 text-gray-400 cursor-pointer",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            }
          )
        }
      ),
      light: /* @__PURE__ */ jsx(
        "svg",
        {
          onClick: toggleTheme,
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          strokeWidth: 1.5,
          stroke: "currentColor",
          className: "size-5 cursor-pointer",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            }
          )
        }
      )
    }
  ) });
}
const FavoriteKey = "TThink_My_Favorite";
const favitoreListAtom = atomWithStorage(FavoriteKey, []);
atomWithStorage("theme", "light");
const logo = "/assets/logo-ChA-14bC.png";
function SideMenu({ data, closeSidebar }) {
  function scrollToSection(aimPoint) {
    closeSidebar();
    const element = document.getElementById(aimPoint);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
  const [favitoreList] = useAtom(favitoreListAtom);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex h-screen flex-col justify-between border-e bg-[#f7f7f7]\r\n     dark:border-e-black dark:bg-gray-700 border-none",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-6", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex h-14 rounded-lg text-2xl justify-start\r\n          text-gray-600 dark:text-gray-300",
              children: [
                /* @__PURE__ */ jsx("img", { src: logo, alt: "logo", className: "w-10 h-8 my-auto mx-2", loading: "lazy" }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col ml-2 my-auto", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-xl", children: "星点" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs", children: "星光点点，汇聚星海" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("ul", { className: "mt-6 space-y-1 overflow-y-auto", children: [
            Boolean(favitoreList) && Boolean(favitoreList.length) && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => scrollToSection("favitore"),
                className: "flex rounded-lg px-2 py-2 text-sm font-bold cursor-pointer\r\n              hover:text-blue-500 dark:hover:text-blue-400\r\n               text-gray-500 hover:bg-gray-100 tracking-wider\r\n                dark:text-gray-400 dark:hover:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx(HeartIcon, { className: "size-6" }),
                  /* @__PURE__ */ jsx("span", { className: "my-auto ml-2", children: "我的收藏" })
                ]
              }
            ) }, 999),
            data.data.map((r, index) => {
              return /* @__PURE__ */ jsx("li", { className: "", children: /* @__PURE__ */ jsxs(
                "div",
                {
                  onClick: () => scrollToSection(r.aimPoint),
                  className: "rounded-lg px-2 py-2 text-sm font-bold flex w-full cursor-pointer\r\n                  hover:text-blue-500 dark:hover:text-blue-400\r\n                   text-gray-500 hover:bg-gray-100 font-body tracking-wider\r\n                    dark:text-gray-400 dark:hover:bg-gray-800",
                  children: [
                    r.icon && /* @__PURE__ */ jsx(r.icon, { className: "size-5" }),
                    /* @__PURE__ */ jsx("span", { className: "my-auto ml-2", children: r.name })
                  ]
                }
              ) }, index);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "sticky inset-x-0 bottom-0 border-t border-gray-300/70 dark:border-gray-800", children: /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "主题切换" }),
          /* @__PURE__ */ jsx(ThemeModeToggle, {})
        ] }) }) })
      ]
    }
  );
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
function Search({ list }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [resultList, setResultList] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const itemRefs = useRef([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleEsc = (event) => {
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
    function handleKeyDown(e) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prevIndex) => prevIndex > 0 ? prevIndex - 1 : resultList.length - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(
            (prevIndex) => prevIndex < resultList.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case "Enter":
          let current = resultList[selectedIndex];
          if (current) {
            clear();
            window.open(current.url, "_blank", "noopener,noreferrer");
          }
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resultList, selectedIndex]);
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [selectedIndex]);
  const fuse = useMemo(
    () => new Fuse(list, {
      keys: ["title", "description"],
      threshold: 0.3,
      includeMatches: true
    }),
    [list]
  );
  useEffect(() => {
    setIsSearching(true);
    if (debouncedSearchTerm) {
      const results = fuse.search(debouncedSearchTerm).map((result) => result.item);
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
  return /* @__PURE__ */ jsxs("div", { className: "relative m-auto w-[80%] lg:w-1/3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: "Search", className: "sr-only", children: [
        " ",
        "Search",
        " "
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          id: "Search",
          placeholder: "搜索...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "w-full border pl-10 rounded-md text-xs lg:text-sm border-gray-300 focus:border-blue focus:ring-1 focus:outline-none\r\n         dark:bg-gray-700 dark:text-gray-300  dark:border-gray-700 py-2.5 pe-10 shadow-sm sm:text-sm"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 start-0 grid w-10 place-content-center", children: /* @__PURE__ */ jsxs(
        "span",
        {
          className: "text-gray-600 hover:text-gray-700\r\n         dark:text-gray-300 dark:hover:text-gray-200",
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Search" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                strokeWidth: "1.5",
                stroke: "currentColor",
                className: "h-4 w-4 text-gray-600 dark:text-gray-300",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  }
                )
              }
            )
          ]
        }
      ) }),
      Boolean(searchTerm) && /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 end-2 grid w-10 place-content-center", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "text-gray-600 dark:text-gray-300",
          onClick: () => setSearchTerm(""),
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Clear" }),
            /* @__PURE__ */ jsxs("span", { className: "flex", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400/80", children: "esc" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 16 16",
                  fill: "currentColor",
                  className: "size-4 my-auto text-gray-500",
                  children: /* @__PURE__ */ jsx("path", { d: "M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" })
                }
              )
            ] })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-11 rounded-sm left-0 w-full h-auto max-h-72 bg-gray-200/80 z-20 overflow-y-auto px-2\r\n      dark:bg-slate-500", children: (isFocused || Boolean(resultList.length)) && (Boolean(resultList.length) ? /* @__PURE__ */ jsx("ul", { className: "", children: resultList.map((item, index) => {
      return /* @__PURE__ */ jsx(
        "li",
        {
          ref: (el) => itemRefs.current[index] = el,
          className: `w-full px-2 my-2   dark:text-gray-300 h-10 flex justify-between cursor-pointer
                     hover:bg-blue-200/60 dark:hover:bg-blue-300/60
                    ${selectedIndex === index ? "bg-blue-100/80 dark:bg-blue-500/40 " : "bg-gray-100 dark:bg-gray-700"}`,
          children: /* @__PURE__ */ jsxs(
            "a",
            {
              onClick: () => clear(),
              href: item.url,
              className: "flex justify-between w-full",
              target: "_blank",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex  gap-x-2", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: item.imageUrl,
                      alt: item.title,
                      loading: "lazy",
                      className: "w-4 h-4 object-cover my-auto"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "my-auto text-xs", children: item.title })
                ] }),
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    className: "size-5 my-auto text-gray-500/80 dark:text-gray-300",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        fillRule: "evenodd",
                        d: "M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z",
                        clipRule: "evenodd"
                      }
                    )
                  }
                )
              ]
            }
          )
        },
        index
      );
    }) }) : Boolean(searchTerm) && /* @__PURE__ */ jsx("div", { className: "h-10 mx-auto flex justify-center mt-4", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400/60 text-center", children: isSearching ? "正在搜索中..." : "暂无结果" }) })) })
  ] });
}
function NavCard({ props }) {
  const [favitoreList, setFavitoreList] = useAtom(favitoreListAtom);
  const { title, imageUrl, description, url, id } = props;
  function changeFavitore(event) {
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
  return /* @__PURE__ */ jsx(
    "a",
    {
      className: "group transition-transform duration-300 ease-in-out hover:-translate-y-1",
      href: url,
      target: "_blank",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-white dark:bg-gray-700 rounded overflow-hidden flex flex-col min-h-20 w-full shadow\r\n       hover:shadow-lg cursor-pointer px-2 dark:shadow-gray-4\r\n      hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 transition duration-300\r\n      dark:text-gray-200\r\n      dark:hover:ring-blue-400\r\n      ",
          children: /* @__PURE__ */ jsxs("div", { className: "my-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex mb-2", children: [
                imageUrl && /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: imageUrl,
                    alt: title,
                    loading: "lazy",
                    className: "w-8 h-8 object-cover my-auto"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "flex overflow-hidden ml-2", children: /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm truncate my-auto ml-2 dark:text-gray-300/80", children: title }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "my-auto", children: /* @__PURE__ */ jsx(
                "svg",
                {
                  onClick: (event) => changeFavitore(event),
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  className: `size-6  hover:fill-current stroke-none 
          ${favitoreList && favitoreList.findIndex((r) => r.id === id) !== -1 ? "fill-red-500 hover:text-gray-400/60" : "fill-gray-300/80  hover:text-red-400/80"}`,
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    }
                  )
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs line-clamp-2 dark:text-gray-400", children: description }) })
          ] })
        }
      )
    }
  );
}
function AnchorCard({ testData }) {
  const [favitoreList] = useAtom(favitoreListAtom);
  const { data } = testData;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    Boolean(favitoreList) && Boolean(favitoreList.length) && /* @__PURE__ */ jsxs("div", { id: "favitore", className: "scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mt-8 mb-4 dark:text-gray-300 border-l-4 border-l-blue-200 pl-2", children: "我的收藏" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4", children: favitoreList.map((card, i) => /* @__PURE__ */ jsx(
        NavCard,
        {
          ...{ props: card }
        },
        i
      )) })
    ] }, 999),
    data.map((r, index) => {
      return /* @__PURE__ */ jsxs("div", { id: r.aimPoint, className: "scroll-mt-24", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mt-8 mb-4 dark:text-gray-300 border-l-4 border-l-blue-200 pl-2", children: r.name }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4", children: r.list.map((card, i) => /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading..." }), children: /* @__PURE__ */ jsx(
          NavCard,
          {
            ...{ props: card }
          },
          i
        ) }, card.id)) })
      ] }, index);
    })
  ] });
}
const twitterIcon = "data:image/svg+xml,%3csvg%20width='55'%20height='55'%20viewBox='0%200%2055%2055'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='27.5'%20cy='27.5'%20r='27.5'%20fill='black'/%3e%3cg%20clip-path='url(%23clip0_1_20)'%3e%3cpath%20d='M30.8555%2025.1953L42.0234%2012.5H39.375L29.6797%2023.5234L21.9336%2012.5H13L24.7109%2029.1719L13%2042.4844H15.6484L25.8867%2030.8438L34.0664%2042.4844H43L30.8516%2025.1953H30.8555ZM27.2305%2029.3164L26.043%2027.6562L16.6016%2014.4492H20.6641L28.2852%2025.1094L29.4727%2026.7695L39.3789%2040.625H35.3125L27.2305%2029.3164Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_1_20'%3e%3crect%20width='30'%20height='31'%20fill='white'%20transform='translate(13%2012)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const dalvIcon = "/assets/dalv-DfgffK5X.png";
const phindIcon = "data:image/png;base64,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";
const angularIcon = "/assets/angular-BTnPrTba.ico";
const devIcon = "data:image/png;base64,UklGRnwBAABXRUJQVlA4TG8BAAAvH8AHAAehtm0bNuT0PkVhI0lpDHtXQGHbRio+5sf5j5bOi/AislmQay1BLsisj+QU5JLdxbbe9Ki2sj5KQkkxEA4mOVwuY2OsGBgDIVv8/xyNg5HDeBFAkmS7bfPfI8EEiiCYlYB3/2sSLi29jej/BPD/CwBmIAlDkQAKAFiHGGMcHYgmxHtfhxhqEHWIoXZPSUpnb9Wu4lQd+vRG6z/aK/dUTkk6nXspp5TSw6L0MFqQgrmnDj8eyqN76/De+8bGpAXkpuRvm5lPmtxbi5kZ0Lx0ObhLL4cbrf/+BZLVru9gw1cr+cM1zz1Im6XJZmmyXyQFI234aq12fYefcso3uEvP7qXL4ZfD+xYkuem7fBXBXxYzkKQF5U/Ww0pmY/rLDCS6j6RPV7rC/FTy7q0zhBA6EPUp6axRKO61e6o4GYko5dlYyDl91gZVTPn+uLVnPluQrP04jmNXgaj9eG9BEo1vwLsVSRJWBO8w8H8MAA==";
const meituanIcon = "/assets/meituan-DTwOBN4C.png";
const redditIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAB8lJREFUWAmVl3uMXVUVxr9z7r0zbYFO25mWWoZ2tAGk1rajtWK1QFuxNLEGo1NiFaMCidHWZzRqFCHlHx/RmCFEgwR5hAjVhvAIVaBAHwYCHUsN2jhFbYfKq6/pY+jM3HuPv2+fs2c66XQaV7LPOfux1rfW2mutvU+iM1AmJepQmmxQzUuylWpVXUtpy5h5H0MXKtPEgv0YY/v4/ivvzYw/nfxZPZ7LOlTSBtUTPou1I16Mn05mGgJeqvlq0FqAr1FZLWF1nafFRZGW4pbSTFUdpP8QrTP5k17y0Kky3Y90mgLZlSonz6iardIE9esWFq7Dhsbghyz3BoITwCOsZUV1cpUSOEqM1pAgdcL94+QR9UXZZog0QoG4IFuui7HmAVW0QINhaZWnRY5YH4WM8rYi3royMuyRnfSuTZ7SPyNG5BkSGCeyFexvpsdRYBpMhi/ThtZFxqF3eq7UMBUfsLR2Im8lxiqTAO7LNPB6NahR11vwrCQ2dkQsywiC4/4Ey0vaWoDbaoOfmdIGqW9AcOR0Ea8LaMdpL9Iupc08D6WOWYkycfQmRi0JnijiLMFXCVpkYc9PajuOXlBYbuedmWzlEZAWrZY6viS9cUDq3iU9t0Gas1xa9Rlpx3bpzpukd0zBG4eqyC4je6fG6cMhJsAuO9VIE4fLLcWe2+1jg1utSjNgKPDDT0uXzCVCdksLPyB99gapebo0Acvf/yHpXy9L2x9grKmsau9gwMiD+zvGDnnOvs9H5Loi4MZ2u8G9c5lzEZo5S3pyk7T4o9KNS6Sffk86eiSfq7PGzZTnR7nAWGdMp3oEW4t7GonWs++7wXGc+ntEWZKaJkv79mAt3+PGSRs3So3jpWuuIw7YgmfZknwLrAbMYBirTm1B5SRUuGqoYC1oaT29aHQycLkJ9wN6GNBFn5O+fav0fWJg/5Z8nB3VwTek5xHxHlorxbJ+9FR5riCuIweIiHZH5lI0aiEKaqxyrueUTsjB6tSSWi+pNkMa5L3voNRLwwFa044ih6TfbZZm028m05qnSee/U/oEdoTUfJsJPFM/mcu1gS5orqpgW4HldIbJPqgQtX0I7u7DffSbifjtIM7hu+Pr0nsXSpPJ83cvQBwMD92DIlj5El7Y9CC8rJsL45HXFLJ/Jv0GvDZ4eKR/OVeS7GPU6kTzUMTRkqqE4DcJokuI6Ms7sLRb2nKH9OXbpStWSDOQlp6qMVyR+kHe+4r01KPSL34gXbVKamMftt0tvY4yzWxHLWxHHaQUT+xKsqt0GAUm0ckAT3QE8IWk1k2/kqbi9pMnpEPk+IxZEWY4sl1BTBle8HfsI0qv7IZ/ujQRy//7H2n916Rdj9Anhmq9eRzgNyJG53k9lITy+Rxfq6/PwZ1C484ZBq9S9U5gQQqbWwSN3/ZASE+UmX1pDl5H+Iw26sNXpb8g2yXajMbkOLcCY5OtM/Udk24j4te0EuFb8jHPxfkXtkrXXy7d0ykNEHABIEcJiyuU7VEoxe6jNFOmQdx/GV8b7sxTyZZFgO5/SN9cL/0bRe76CW7EG9EDBuz8rvTyDukL35D27LY/c17LcNZsvEsirFSF30I9D7Y90DOkQA0FphJknX+Qfg+DKe7rhW3USoLyb4x9/PMkLBZF5RpIsxWM7WTuuiukadP5OIUe+yMV8l4y6l1kAtkFZ4HZU+azi+x3FuAv1KoSdPNY0kvgeT+TwgtTpkm3/lr6FtswE0EmK2cl/F79Ran9MqmFdS0oEMZtH9Tbm9eJGjESDGLSU1V1+eU7XEF81FGgme6Oh8ljlIhkgROnSG0XD6ehxyJV8MKcdqy/IAf3OHqF2Ol6QrJTasd5FDz5a3NKEXqaunSAxaUw64p1DoH2bDeHDPls8mJr/jbK3XtbnmLBYYwFi5jfu0e6m9Q96mLDeFRu25PEFApMRmZQAEZjGRNs6yhOpjtwyQ24pEqXKsNwqYWyS2n9zSbpIxQgk9PSZ/yj7OeESVjbloMd6OESwtqr1xBoS+AtClXXNukr9JsoQC6PmcWDkV9OfsuF9caowHz0ep7WyIJgrxKnDU7ZSy1fT1as/JR0LkXE5Nh4dS9bhLWmJpRpncXW2ImQi9fmx6QfXYvl7HJ5fL61Q7K5faRalGzSrlK4jj2s126erSYuC4sJRquJpBrW8WqeKt1+P4q8SBFBUIW7ynje4dCh3p9P85E82E/F2ye9gNWdNwO+nrOCYHKUheDjbesryK7rl1h/X8DG3HzHfA0fvpIVW2EenNTYStHs4UCi+0Fa+0p+S+bmlc7zx4ny/X/nMCJwtxZrnM4D+7EZQ3Ia9UqWb0FxQRzzUhpuulg0AFgv9cLeZ1sD4RDhBDVRthuJHRc0H+HDlIOPdimNa7Irix+Ss13LfSlJQUxJO3+bbKWzp068+A4wTI4ng1dw+1s462pc3xWxvCx4IK6PE5yQFzH2IGxn+TGJ7MYZQR5AK+KdkOEeuBMFRv0xcYgMUfIMv2T2xBPq5oBejO4/Q8V+hJR5G81C3UgDZ4txArgfHsvnvdapZt6qfh6u4aP8FbE+CPV7BMUfFQ8SF/Nw4VpwPolINhgq4HNs+lbNLZpTpcik/Jxyfv7fP6cwBcKkkb/ny/jnKWkZk6f/nvtE9aHmcyWltKdUuMf1qgXZmLF+z/8HuObo1EzDKmUAAAAASUVORK5CYII=";
const v2exIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACPTkDJAAAElElEQVRYCa2XuUtsSxDGe/Q4jgvugZEoGrjAC1zAQI28icE1eRgKBmJgIgYqmoiBiJngn3GT91IzRVBEhOeCgYKZJq64jON2+9fX79BzHL1yfQVnqrqr+vuqq/qcOSdmXuXl5SVnd3f3x9XV1bfb29tEKpUyz8/PMfm/orOysl7i8bjJz89PFhUVLTU1Nf0di8UewHQE+/v7f52enm6cn5/Hv0L02bUlJSWpioqKtvr6+v8Cdr66urpxcXFhk4ybxsZGU1ZWZnJzc43NMg3Txro5NIJfc2mBkYGtpKGiZ2dnZm9vz8BlQzbs2sLYzs7OP0dHR98hb29vN4WFheFygb9HGPWHC1+NaILE39zcmLW1NZdQdXX1v1n0nPiGhgZTUFBA383T05O7WICN9m35FYvmIkY6UzxzcMCFwB1w4BhQdgJ0MYcw9sUfY2uXion6mffnGMOFwB3QG4QWIH4wu4EAjYgMLfHjZUsT49vgZGdnm5ycHLcc7sBOOjSB+gtkS0cBHcof/Njb0q2CO9B6SKI7HBoaMsvLyy7E9zMRjeWuGR0dNf39/YJ8E6ONSBMYJsAAhy7G9vY0yjZKiN+Xx8dHMz8/727fvr4+5xKRNJM+PuM3CSgIDblaw9gXgJSUPz87O+tu5Z6eHkfmx8j2McMElCUHRQFBELp9jt/a09PT7nbr6upyB1h44pAG6NdpsAaTcsjmxFIFLtnoTJcfw/qpqSmzubnpkhWej+8cfgKa8IMhogpcEEj7ZEoGnx/PmRgfH3ePXh9TSYgvrcZySq+vryvuQ318fGyGh4fNyclJWtz9/b1LYmFhwdTU1IQV9oPSWoCDMyBRImjfjvorKyvN4uKiKS8vf9Oe6+trMzExYR4eHsI2CwucjBVQEjypCPYPEbYAZNMSbLVBCUrTmvckTECg0iyQLe3P+TYtYJf2z8VVAJ+SKy4uNnNzc+4MsTEfi7gwAQaIH9Db2/vu7n9Fp/9Gd5qXl2d4LlRVVRkOZSbJmADZI5RUCWlH8jGvuUzA/OHMzMyYuro699/vxwjTccihSbRsevtZUTJo1k1OThr77ufIhQeWbzNOq4Cc0pT0vR37hAJW7MjIiGlpaTHJZDKtStE1aQmIVBrnRwng90Xgg4ODpqOjw/AMQHw83V3+3Jsa49TV2trqyklJ9RRE63aTJlEO3MDAgOnu7nY714kXlk/qJx62gADtQqUcGxvzY39rg8HOtdMonpKQBjCwu3uxC2KaRMsGSMkQHAVkTsIaeu6vF440sdi81CJwB9wuZM1Tj/dCyq2Au7s7t0BJsFhJOITIj3zvxdMqMPRMgDsrkUgkwbEfCw7OTb7efiol2rfFq52huYiRjsazMbARccEd2A+RpcvLy+8HBwfuJcJ+v7nXKpH4OrpD3/cZm+T4MIELsd8IS/Q+Z2Vl5do+x+NkWFtba3h+0w6V8jPgH8VQDf4N7UbN4eGhs+1Haqqzs7MwsCQP29vbbRZggyTsh+pHWP+LD/LS0tI2uMMvDCqxtbX1w5bomz18CQ6KzTz0f4WZ00516blt8VJzc3P4ef4T91unl7o5UZQAAAAASUVORK5CYII=";
const opggIcon = "/assets/opgg-CToAzyhl.ico";
const pincongIcon = "/assets/pincong-BujtyGt9.ico";
const nicovideoIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0NDT/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQ0NP8AAAAAAAAAAAAAAAA0NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/wAAAAAAAAAANDQ0/////////////////////////////////////////////////////////////////zQ0NP8AAAAAAAAAADQ0NP//////////////////////NDQ0/zQ0NP80NDT/NDQ0//////////////////////80NDT/AAAAAAAAAAA0NDT///////////////////////////80NDT/NDQ0////////////////////////////NDQ0/wAAAAAAAAAANDQ0/////////////////////////////////////////////////////////////////zQ0NP8AAAAAAAAAADQ0NP//////////////////////////////////////////////////////NDQ0//////80NDT/AAAAAAAAAAA0NDT//////zQ0NP//////////////////////////////////////////////////////NDQ0/wAAAAAAAAAANDQ0/////////////////////////////////////////////////////////////////zQ0NP8AAAAAAAAAADQ0NP////////////////////////////////////////////////////////////////80NDT/AAAAAAAAAAA0NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/zQ0NP80NDT/NDQ0/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDQ0/zQ0NP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0NDT/NDQ0/wAAAAAAAAAANDQ0/zQ0NP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQ0NP80NDT/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDQ0/zQ0NP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAN/7AACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAA/n8AAPmfAADn5wAA//8AAA==";
const nytimesIcon = "/assets/nytimes-CwmmMkJp.ico";
const wsjIcon = "/assets/wsj-BD2GoC6d.ico";
const nikkeiIcon = "/assets/nikkei-BRDs0N_M.ico";
const medumIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADv0lEQVR4nMVXvS9zbRj/nfa0pxKRIizqEQZaU4cOEsMzkOogYa3E10CqviIinSTP8v4FNAaEsGBo4xVLY8AghurS+mp8tB4Gok9aRdE61zuUw6EfmryPXsmdnOv7l1y/c+e+gDdRARgD4APwDID+5/MMwP/SoxQf5CeAwF9omuz8eekJvKD5zuavJwCgVArgn/dovlFyAMgYxOfyIwsAAMDPIE4OSZYA8Azi88iasImMHMehvb0dGo1GZF9fX8fy8nLKggUFBRgdHRXZvF4vZmdnEYlEEuYkZKlMJiOPx0Pv5ejoiFiWTcnu4eFhUY7X6yW5XJ4qJ3kxu91OH6WpqSlpPMuydHBwQM/Pz0L86upqSsBpyefxeER6b29v0liDwYD9/X08PT0JNp7nU9ZPC8BqtYLojad1dXWorq5OGNvf3w+r1ZquJPLy8tDY2AiTyZQewM7ODra3t98QSyQwm82f4jQaDYqLi7GxsZG0FsMwMJvN8Pl8GBgYwN3dHYA0HNDpdNTS0iLiQTAYJKVSKYodGxujrq4uYlmWIpGIELuysiLEWCwW4nme9vb2SKFQfI2EOp2OFAoFnZ+fi0AMDg4KcUqlkk5OTig3NzcpALVaTY+Pj0RENDQ09HUSAsDDwwOmpqZEtp6eHkilUgBAa2srbDYbbm9vk9YwmUyQy+UAIBppwosokUxOTsJisUChUAAAqqqqoNfr4XA40N3djebm5pT59fX1wrfRaERDQ0NmAC4uLmC322E0GgVbX18fiAinp6c4Pj5OmsuyLMrLywHEf8uFhQXc3NwI/rQceNVra2uJ53lhvrFYjFwuF+n1etFl9JEDHMdRNBolIiKe56mysjIzDrzK1tYWXC6XoEulUnAch7W1tZR50WgU4XAYQPxXNBgMgi8jAESE8fFxkW1iYiLtbcfzPNxut6CPjIygqKgocwAAsLS0hKurKwBAMBjE/Pz8l/JsNpvwrVKp4HA4oNVqMwdwf3+P6elpAMDc3BxCodCX8mZmZnB2diboWq1WGGdCAsrlcnK73dTW1vbJV1ZWRpFIhNRq9SdfRUUFxWIxgYS7u7skk8kIANXU1FAgEBBdaFIAvz6i5TgOHR0dCIfDyM/Px/X1NS4vLwV/KBTC4eEhNjc3RXklJSXo7OyE1+uF0+mE0+mE3++HSqWCx+OBz+fD4uIicnJyUFhYCIZhkLUnGcMwkEgkyPqjVALgd5aaA8C5BMBKFgH8C2RvNfuDd0vqzxfDdzUPIME6WIr46uzH31vPffiwnv8HCkEH6ZPjzN0AAAAASUVORK5CYII=";
const tailwindcssIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABU1BMVEUAAAA4vfg4vfc4vvg2vvU4vPg4v/c4vvk4wfo4v/k4vvc+uf03vvc5vfc4rv81wvg5vvg5vfk5vfg9vfs8vfs6v/k7vvo3vfc4vfk4wPs0vfc1vfc3u/k2u/k3v/k5wPs4zP84u/c4vPY4vPc4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vPc4vvg4vfg4vfg4vfg4vfg4vfg4vvg3vvc4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vvg5vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg4vfg5vfg4vfg4vvg4vfg4vfg4vfg4vfg4vfg4vvg3vfc4vvc4vfg4vfg4vPg4vvg4vfj///8fGfk0AAAAb3RSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAwQRUIGXgFECAQN57f7uggkErP34+/zOHo/64CUFDjelQF/A4ScWk1rrXgwGPtxyCi1v0N3IaSxF1zEEEAQMZLXsYQoEAwYJAwFIr8c0AAAAAWJLR0Rw2ABsdAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+UMBg0qC5qnFL8AAAH7SURBVDjLvVNnV9tAEPToEE6AFJyC09vdGRsrGJmArANsejcJYMDUOKak7///lj1Jfi+Uz+zTuw83o92d0SiVut2CLQfOzagApNJcSjLtGtxlYdd1ozaWIi7j3RZHbjBfKAwVc/A8IH1luvw4XBohn/gpj366oyzjLl/HeA9k79g4BZVKGIYmoIlJqGhj6XUaKEyRISJje1SpNo0ZCan7ZmPCPYU5mi8uLC5FDAppeQXefYnVfNLBw9o6HxKlmGGovvH5wZfNre3OiMYO2AGtsUvGjgoCqu81aX+Y0Yfoz0jJKl1eagYHPMEEvqlaPYeIDNTq0eMnT5WWcByNo5pVa/Uen0Bxd499+9pqfRMueylYT/v0rHl+3jy7aAx44P36vl/EF6dtqLTIKpkVP1otjYxkQ1MKJ8edlrUj6PQzO/L5i5ev7Egm4LDMUNX4gQmJDqw/eC0Ub40sMqzh5z419+pWFlmBu4nanUbnk29vbf56096oR0b7hkrslof1NT5iQn4V8q2HlWX2N2IsLS4U52kOqj8mzA5o6bI/0zWq+hHDGj0FJZIO1gUbIkxOEO8ZhpVKQONjvRI9MYHxdymHGe9/j5bjwIyU/vyVV2LJDI5ZrjhUKOQHc1Eouy+H8oMNZda+loS26/pPIUQn9uKG2CeDnGjjW/hH/69/pCdxDbuu+UQAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjEtMTItMDZUMTM6NDI6MTErMDA6MDCnwnNMAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIxLTEyLTA2VDEzOjQyOjExKzAwOjAw1p/L8AAAAFd6VFh0UmF3IHByb2ZpbGUgdHlwZSBpcHRjAAB4nOPyDAhxVigoyk/LzEnlUgADIwsuYwsTIxNLkxQDEyBEgDTDZAMjs1Qgy9jUyMTMxBzEB8uASKBKLgDqFxF08kI1lQAAAABJRU5ErkJggg==";
const boxiconsIcon = "/assets/boxicons-BNmVA4s4.ico";
const flaticonIcon = "/assets/flaticon-WlG_ILl-.ico";
const chromestoreIcon = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20height='192'%20viewBox='0%200%20192%20192'%20width='192'%3e%3cpath%20d='M0%200h192v192H0z'%20fill='none'/%3e%3cdefs%3e%3cpath%20d='M8%2020v140c0%206.6%205.4%2012%2012%2012h152c6.6%200%2012-5.4%2012-12V20H8zm108%2032H76c-4.42%200-8-3.58-8-8s3.58-8%208-8h40c4.42%200%208%203.58%208%208s-3.58%208-8%208z'%20id='a'/%3e%3c/defs%3e%3cclipPath%20id='b'%3e%3cuse%20overflow='visible'%20xlink:href='%23a'/%3e%3c/clipPath%3e%3cpath%20clip-path='url(%23b)'%20d='M8%2020h176v152H8z'%20fill='%23eee'/%3e%3cpath%20clip-path='url(%23b)'%20d='M116%2036H76c-4.42%200-8%203.58-8%208s3.58%208%208%208h40c4.42%200%208-3.58%208-8s-3.58-8-8-8z'%20fill='%23fff'/%3e%3cg%20clip-path='url(%23b)'%3e%3cdefs%3e%3ccircle%20cx='96'%20cy='160'%20id='c'%20r='76'/%3e%3c/defs%3e%3cclipPath%20id='d'%3e%3cuse%20overflow='visible'%20xlink:href='%23c'/%3e%3c/clipPath%3e%3cpath%20clip-path='url(%23d)'%20d='M32.07%2084v93.27h34.01L96%20125.45h76V84zm0%200v93.27h34.01L96%20125.45h76V84z'%20fill='%23DB4437'/%3e%3cpath%20clip-path='url(%23d)'%20d='M20%20236h72.34l33.58-33.58v-25.14l-59.84-.01L20%2098.24zm0%200h72.34l33.58-33.58v-25.14l-59.84-.01L20%2098.24z'%20fill='%230F9D58'/%3e%3cpath%20clip-path='url(%23d)'%20d='M96%20125.45l29.92%2051.82L92.35%20236H172V125.45zm0%200l29.92%2051.82L92.35%20236H172V125.45z'%20fill='%23FFCD40'/%3e%3cg%20clip-path='url(%23d)'%3e%3ccircle%20cx='96'%20cy='160'%20fill='%23F1F1F1'%20r='34.55'/%3e%3ccircle%20cx='96'%20cy='160'%20fill='%234285F4'%20r='27.64'/%3e%3c/g%3e%3c/g%3e%3cpath%20clip-path='url(%23b)'%20d='M8%2020h176v76H8z'%20fill='%23212121'%20fill-opacity='.05'/%3e%3cpath%20d='M8%2095h176v1H8z'%20fill='%23212121'%20fill-opacity='.02'/%3e%3cpath%20d='M8%2096h176v1H8z'%20fill='%23fff'%20fill-opacity='.05'/%3e%3cpath%20d='M116%2052H76c-4.25%200-7.72-3.32-7.97-7.5-.02.17-.03.33-.03.5%200%204.42%203.58%208%208%208h40c4.42%200%208-3.58%208-8%200-.17-.01-.33-.03-.5-.25%204.18-3.72%207.5-7.97%207.5zM8%2020v1h176v-1H8z'%20fill='%23212121'%20fill-opacity='.02'/%3e%3cpath%20d='M76%2036h40c4.25%200%207.72%203.32%207.97%207.5.01-.17.03-.33.03-.5%200-4.42-3.58-8-8-8H76c-4.42%200-8%203.58-8%208%200%20.17.01.33.03.5.25-4.18%203.72-7.5%207.97-7.5zm96%20135H20c-6.6%200-12-5.4-12-12v1c0%206.6%205.4%2012%2012%2012h152c6.6%200%2012-5.4%2012-12v-1c0%206.6-5.4%2012-12%2012z'%20fill='%23231F20'%20fill-opacity='.1'/%3e%3cradialGradient%20cx='7.502'%20cy='19.344'%20gradientUnits='userSpaceOnUse'%20id='e'%20r='227.596'%3e%3cstop%20offset='0'%20stop-color='%23fff'%20stop-opacity='.1'/%3e%3cstop%20offset='1'%20stop-color='%23fff'%20stop-opacity='0'/%3e%3c/radialGradient%3e%3cpath%20d='M8%2020v140c0%206.6%205.4%2012%2012%2012h152c6.6%200%2012-5.4%2012-12V20H8zm108%2032H76c-4.42%200-8-3.58-8-8s3.58-8%208-8h40c4.42%200%208%203.58%208%208s-3.58%208-8%208z'%20fill='url(%23e)'/%3e%3c/svg%3e";
const tellyouIcon = "/assets/tellyou-C64_99Ip.ico";
const pexelsIcon = "/assets/pexels-Bs3dQAxv.ico";
const uisdcIcon = "/assets/uisdc-C874BlOV.ico";
const freecodecampIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACQ1BMVEUKCiP////+/v79/f38/Pz7+/z7+/v6+vv6+vr5+fr5+fn4+Pn39/j29vf09PXz8/Ty8vTs7O7s7O3r6+3q6u3o6Orn5+rk5Obj4+bg4OPe3uLd3eHd3eDc3ODb29/b297a2t7Z2d3Y2NzX19vW1trV1drR0dbQ0NXIyM7Hx83GxsvFxcrBwcjBwce/v8a+vsS9vcS7u8K3t760tLyzs7uysruysrmxsbmwsLevr7eurrepqbKoqLGnp7Clpa6hoauenqicnKecnKacnKWYmKKVlaCUlJ+Tk56RkZ2RkZyOjpmNjZiMjJiJiZaJiZWGhpOEhJCDg5CCgo+AgI1+fot9fYt9fYp8fIl6eod3d4V2doRzc4FxcX9ubn1paXhnZ3ZmZnZkZHRiYnJgYHBeXm5cXG1cXGxbW2xYWGlXV2hVVWdVVWZRUWFQUGJPT2BLS11GRllDQ1ZDQ1U9PVA7O084OEw3N0s2Nks2Nko0NEk0NEgvL0UvL0QuLkMtLUIsLEIqKkApKT8nJz0mJjwlJTslJTkkJDojIzkfHzYcHDMbGzMaGjIZGTAXFy4WFi0VFSwUFCwTEysSEioREScQECgPDygPDycODicODiYNDSYNDSUMDCUMDCQLCyQLCyMKCiQJCSMJCSIICCIICCEHByEHByAHBx8GBiAGBh8FBR8FBR4EBB4EBB0DAx0DAxwDAxoCAhwCAhsCAhgBARwBARsBARgBARYAABoAABkAABgAABcAABYAABUAABQAABMAABIAAAwv4ILiAAACPElEQVR42s2TV1cTcRDF5xIbFuy9IfYCFlTE3sXeu4JdFBWxYFewAip2srv/THQpJkTAgGi2JfjRzBZ4UJ89ztPce37nzJ05Z+h/KZb4L6bCXS2bbZ296AJaLdUjmLS9K7+4Qm1hD9T2rAqGXTxgbsOOmNM3vCz9zi4QO4vsz6otJOMYtscdm8MvRuWbkkt0nMF6TUk20TspuTo7QKC5vI+vOOna5e/YiSJdJqEv7vWsUXY8KV4ATHxbx250Sh/LKrXfwuaE5MWNZKI3jlqd+CmcNimxCzfdhCQbxUjpjmxvEw5Vp+XoFJs7TFI9p24muvkwgV2eFGPOED/R6BmGa0jWEfj6ZmCSGmXHkM2NqCT/4FzTiS3a7w0Acoqx5smhWMABrP0oJ3noIhfg6AL4cKMMS5fgbqvwgEdEY2aZtlK0y+iBTT9LgJ7Is2RnxBZUUSxrZMhdagOQUZ0oRGoqppHKNrBwoJ861uFxc8COMB84ruuF9iLpb+qZSFVHZLaTfhEFcdk+wjKMf1Vb/3w6+iErREFS9GvYHaf698OnhIW9ZD5WWzJHlKcl2BeXiGqMFXgQTQ46iJOJD8QNrwdtTUjEIn5/XFWYya9fx3JNENfWTO1fZghSjPNrdUEkfztQZMgkmt5NTnvYZKfTbqdmVDQysVZaGWIOV1zVkqJWzMM5S3YvegGz7etyRDg6wnbmPBw2ZSKXuHIiHCSiwCdbqvadueVSoT3QI77+oN/rY5shgl2KBf1RQvyrt/wFq6brivKpmbQAAAAASUVORK5CYII=";
const smsactivateIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAABE9JREFUWMPtl7FvI0UUxn87uxYUV2yEQEIU7OqSa7M4d4iKLH9BfC0U8RXUXuRYV56hg8TCV1DHkSigiu8viCMKKnKbCim5aH0FFZFiCRASu/uGwrPxxmcnPqBB8Ekr747fvu97b968mYX/8S+BC9SBXSABLgBtrqfAPrBp7F4K1gLEDUM+BPaAgbkvEJgrNONdYJREgUvF3tSamqXo+V/8sPeyAkIT8ROgDYxuiua0eTd0LFkXi0ALzzXSd3KGUlFf3t4+up88DLwsU3WtpH9nO46vE9AAIuCBiXgmkihw04qq2WKto7SrRAYoDn3jvLARRzVEY1nggnY1urfSiQcAzjXkH0ylGoCT1r2govMNsQhEGIEcqpxP/E48mpC+51FJN3LRfgYjtAwKwqQVBJKpWhHYdAY8xkX1TkGeRIGb2U5gITUsvaq1dQgTh2UbkNAC10YScvb87kTUafNuCBLall4XeL6887Q+S0Bi5vuyYE5a1boNGyqVB9MOf82z+JbtBJaSmhbpT4tKK6pmCd54RAZOTux349GzVrVuKxn4n8fD8hTUze+Vaq2k0s8rKijIk+ZaI0f7orLYxV7NLLGWt4+iyyJUejUTvQRyUUnlid+Nh2XRyVZ1Q2sdZJnygHZZwKaJ/grGitfeviwoS3vLO0fR2VY1yrUerXSOeklzrZGhlyAbkLK3UoiNAvekVa0rIRh7y10yHVngOehheQpck/6lWdX+rFnt2rl0/W48PG1W2wpQSvr+dhyfbVUj0RIX6S+WYqYL35N6ebZVHSzvHIVl30UGQiBmDjTSzxxVA7oWuCqXLjmjs2a1rSzp396J46S11shF+zZZQsbjlVK9XMLiYnpImd8AOJ4nwMmJlcU6gK3sXmY7nlTUrsqlR8rwrFndJc2f2Lm0M9SSP4P8tHk31JrDeQJgfqdz/W7sATyNApc0HVpW/kil8oBXQCpqV9nWILNVPbdV28mlN+3gpHUvUEoa2pLBC8FxPfbN9LhfH/08+DB4LfA78eC0GXz62Xc/tXPNxvkv6f2vah4rnfhy9Uz3DiQ/FuTxnc6kQ84S4E799wioFQ/fHJ+PPqq+XgPilU78pZk2gJq/HbeL7ifoUABHsgE57dJ0NIBV4PEsAcMyGeOO2C4b/nj+u3f+W7oEHJTIefj+Wxsfv/vGeq7/ONYifWeqA5YQAj3mwIUrFdpjst9rQ9pmvFQvx9+8VekmUeCxGBIT2FwcGJXeFPk+Vw8g2jjbZ7z3L4LQ+L8WdWM0Hf2sq7DZXFDAwaK2V1I85zowGdlfkLxu/C6cqpsERIy37PYC/jxDHs4zsKeeh4z3h3kv9IBXzf23zDiwlOAC3zPeXXuLZqBAe0bkF0wOn8GCkS+SpbmIuFr9tQXecRk3sMS8/7fhMU5fwviEHPJix3TNeNcIPuCG9f5XhTSM82I6EiYfKUWjcl/W8U0fJvPglsiG/3S0/y38CZ6yHuBJCakFAAAAEnRFWHRFWElGOk9yaWVudGF0aW9uADGEWOzvAAAAAElFTkSuQmCC";
const shopifyIcon = "/assets/100_shopify-BqWNjxT8.ico";
const devblogsIcon = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAAgACADAREAAhEBAxEB/8QAGgAAAgIDAAAAAAAAAAAAAAAAAAUCBgMEB//EACYQAAIBBAEEAgIDAAAAAAAAAAECAwAEBREGEhMhQQciMVFhgZH/xAAaAQEAAgMBAAAAAAAAAAAAAAAAAQQCAwUH/8QAIhEAAgIDAAEEAwAAAAAAAAAAAAECEQMEIRIFMVFxQmHB/9oADAMBAAIRAxEAPwDm9e0G8KAKAKAnBF3p44t662C7/WzWMnSbBc838aS4bN39gb9Z7a3s57uK5SPxKYvDIRvwQwIP9fuuTr+rLNijk8abaTXxfszFMx5ThuFw15a2l7l8mryrGXdceDGOtAwCsZB1fkD17rLDv5s0ZThBcv8ALvHXxwWKuY4Kw45mJsXZ5Ce9ktnaKdpIBEAwOvr9jsf5VnR2MmxiWWcaT6u3/ESnYtxs9nbyPJdxTyMqgw9twoDhgdtsHY1vxVjLGclUH9/QLefktZJeSrLYNJb5fvvbKz/a0eQaJB9gjWx/Arlr0mlhqXYVf7SIo0uU8usc+bWeNMsk8PZBimuQ9uoRAp6F14J0Pfs1t09GeDyi/GnfUu9d9YSoS8my65/kGRyqRNCt3O8wjY7K7O9bq5qYHgwxxN3SolCyrBIUAUAUB//Z";
const dropboxIcon = "/assets/103_dropbox-BWxwbNvt.ico";
const codinghorrorIcon = "/assets/104_codinghorror-BHuasT67.ico";
const wbwIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAC8v73/Xnpx/xg51P8eV9T/I19T/y9+e/803t7/N4yM/xE/Nf8ucMX/EFLT/12Khf+rr63/AA8K/z6hof81xcT/WlRP/y1yjv8AAP3/NZjB/wAAAP89t7n/IQAA/wAAAP/KwLX/tKad/wAAx/+8vbL/AAAA/7S1tf8URkj/NZOV/2OHgv8AMLb/AADT/yeAfv84u7r/AC0w/8u9sP+9r6b/vK2i/+rp4/+roqT/uKec/5iJf/+ytLT/AAAA/5ykov+epZ//183J/8S9sv+Mf3j/clNH/7ilmP+0opb/5ODa//H6+f/9/////////97a1f/Ft6n/hoOC/+ft7f/3////4t3X/8nCt//Tz8f/0cjA/8O4rP/Lv7T/yLiu//b+/v/Hu7D/o4R5/7melf/Evrb/tqGV/+nr5P/9/P3/+fn5/+/u7f/r7Ov/19HL/87HwP/Nxr3/wLOr/+/49f/v9/b/0srA/6mSiv+rlYH/5NzZ/7qtn//l493/+vv7//n5+f/6+vr//P39/9PPyf/U0Mf/zMW9/8rBuv/u9fP/9P3///Dz8v/k49v/5uro/9rc2P/EuK3/7/Lx//r6+v/5+fn/+fn5//v7+//o4uD/zcjA/83Gv//Qy8L/2dnU/9fPzP/m3tv/08nE/9/b2f+8pp3/w7ey//v+///5+fn/+fn5//n5+f/6+vr/6+zs/9nRy//LyL//xr62/8e+tf+Ra2L/sJSN/8Oyr//c19D/nHds/8zAuv/8/v3/+fn5//n5+f/5+fn/+vr6//f59P+NZ1X/sJJ//7qlk/+7p5f/sJiM/+DTyP/49u3/6+jg/8izpv+4opj/+v39//r5+f/5+fn/+fn5//////+hmJn/AiJp/yMxl/8tDYr/Rzpp/zYAcv85AGD/MwBU/xwAcv8qE3//JQRb/+/t6P/7+/v/+fn5//r6+v/29PD/FD41/yXKx/8tUVn/NouV/yJsav9Afa//N3ur/xUqN/87cqj/N3WB/xWDgP9ybGf///////r5+f//////jXFr/xSem/8i////KQAA/x2Hhv8a9/b/IQAA/xVNRv8d////GEBA/y5FRP8Y////Ay0p/8e6sf/9/v//6uTh/wDg3P8A////AP///xS8vP8D////AP///xOWmP8e2Nr/AP///x/i4v8YjYz/AP///wD///8lrqr/9vb0/6SspP84tK3/Pa+p/z6up/8/s67/PK+o/zyuqv87t7L/O7Ot/z6vq/8+s67/PLez/zuwq/89sqv/OrWv/6ainP///f7///39///9/v///f7///3+///9/f///v7///7+///+/v///v7///3+///+/v///v7///7+///+/v/+////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
const programthinkIcon = "data:image/x-icon;base64,AAABAAIAICAAAAEACACoCAAAJgAAABAQAAABAAgAaAUAAM4IAAAoAAAAIAAAAEAAAAABAAgAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAmb+AIKy/gDO4v4AWp7+AL7a/gDu9v4OInr+Dp7G/gAScv4Ajr7+AN7u/gByqv4A/v7+AAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAOAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAgwMDAwMDAwMAgcAAAAAAAAAAAAAAAAAAAAAAAAJDAwMDAwMDAwMDAwMDAwJAAAAAAAAAAAAAAAAAAAACQwMDAwMDAwMDAwMDAwMDAwJAAAAAAAAAAAAAAAAAAEMDAwMDAwMDAwMDAwMDAwMDAwAAAAAAAAAAAAAAAAABwwMDAwMDAwMDAwMDAwMDAwMDAcAAAAAAAAAAAAAAAACDAwMDAwDAwMDAwMDAwwMDAwMAgAAAAAAAAAAAAAAAAwMDAwMAAAAAAAAAAAAAAwMDAwMAAAAAAAAAAAAAAAADAwMDAwMAwMDAwMDAwMMDAwMDAwAAAAAAAAAAAAAAAAMDAwMDAwMDAwMDAwMDAwMDAwMDAAAAAAAAAAAAAAAAAwMDAwMDAwMDAwMDAwMDAwMDAwMAAAAAAAAAAAAAAAADAwMDAwMDAwMDAwMDAwMDAwMDAwAAAAAAAAAAAAAAAAMDAwMDAwMDAwMDAwMDAwMDAwMCgAAAAAAAAAAAAAAAAwMDAwMDAMDAwMMDAwMDAwFAQEAAAAAAAAAAAAAAAAADAwMDAwAAAAAAAAMDAwMDAEAAAAAAAAAAAAAAAAAAAACDAwMDAwDAwMDDAwMDAwMAQAAAAAAAAAAAAAAAAAAAAcMDAwMDAwMDAwMDAwMDAwIAAAAAAAAAAAAAAAAAAAAAQwMDAwMDAwMDAwMDAwMBwAAAAAAAAAAAAAAAAAAAAAACQwMDAwMDAwMDAwMDAUGAAAAAAAAAAAAAAAAAAAAAAAACQwMDAwMDAwMDAwKAQAAAAAAAAAAAAAAAAAAAAAAAAAAAQcCDAwMDAUECwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///AAAADgAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABwAAAAygAAAAQAAAAIAAAAAEACAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAACZv4CgrL+gu72/s5env5ars7+vjKC/u4Scv4ijr7+nv7+/hJuqv6Ovtr+3gAAAHIAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAcCCAgICAIHAAAAAAAAAAcICAgICAgICAcAAAAAAAACCAgDAwMDCAgCAAAAAAAACAgJAAAAAAkICAAAAAAAAAgICAgICAgICAgAAAAAAAAICAgICAgICAgIAAAAAAAACAgJAAADCAgBBQAAAAAAAAIICAMDAggIBQAAAAAAAAAHCAgICAgICgAAAAAAAAAAAAcCCAgIBAYAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAD//8ADQSCAAcADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADgAE=";
const googlefontsIcon = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%3e%3cpath%20fill='none'%20d='M0%200h16v16H0z'/%3e%3cpath%20fill='%23F29900'%20d='M13.5%202H8L1%2013h5.5z'/%3e%3cpath%20fill='%231A73E8'%20d='M8%202h5v11H8z'/%3e%3ccircle%20fill='%23EA4335'%20cx='3.25'%20cy='4.25'%20r='2.25'/%3e%3cpath%20fill='%230D652D'%20d='M13.33%2010L13%2013c-1.66%200-3-1.34-3-3s1.34-3%203-3l.33%203z'/%3e%3cpath%20fill='%23174EA6'%20d='M10.5%204.5A2.5%202.5%200%200113%202l.45%202.5L13%207a2.5%202.5%200%2001-2.5-2.5z'/%3e%3cpath%20fill='%231A73E8'%20d='M13%202a2.5%202.5%200%20010%205'/%3e%3cpath%20fill='%2334A853'%20d='M13%207c1.66%200%203%201.34%203%203s-1.34%203-3%203'/%3e%3c/svg%3e";
const trendsIcon = "/assets/109_trends-DbBf2sRS.ico";
const ngaIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAA1sq7AIRjNwB+WywA0sa1AN/WywCTeFAAgV8xAKGIZgCIZzwAqJBxANvSxQB/XS4A/Pv6AMe3owCLa0EAknNMAKKKaAD///8AjW9GAIttQwCMbUMApo5tAMy/rQB1UB4AiGk9AMu9qgCPcUgAybunAH9cLgDTx7cAfVorAHtYKADRxbQAvqyVAHxYKAC1oocAeVYlALuojwB9WioA3dXJAIJgMgDe1ckAvKqRAIZmOgCAXi8A9vTwAJp/WQCehWEA4dnOAJJ0TQCDYjQAwrKbAM/CsQDp49sAx7ijAOfh2ADu6eMAsp2BAKyVdgB8WSoAkHJJAJ2CXwDXzL4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHBwcHHyQEAgcHBwcAAAAHBwcHIC8NEiI8BwcHBwAHBwcHLQMmEhI/IAcHBwcHBwcHBy0tHBISOjwtBwcHBwcHBwwdPAg4JB0VDx0HBwcHBx0zCQcHLCU9NjEPHQcHBwMVNSgZDAMzMRISLwMHBwclFhISFR8nHBISGiUgKQcHAgsSLhkHNxISHhgXNSUHBx00EhIhMRINKykwLzUlBwc8GwsSEhIBCjI+Cw4lBwcHKSMpIgQRMxg0OT4FMgwHBwcpAx0yAjs5BiomMwItBwcHBwcDNjgnBRoUJCwMBwcABwcHDBYBPhAaGR8pBwcAAAAHBwclEy8DLAktBwcAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADAAA=";
const excalidrawIcon = "/assets/112_excalidraw-D_c4FDF-.ico";
const doodleboardIcon = "/assets/113_doodleboard-S1YlOl1i.png";
const blockexplorerIcon = "/assets/114_blockexplorer-DoG5roOp.ico";
const browserIcon = "/assets/115_browser-Bd5hSU6s.ico";
const alloyteamIcon = "/assets/116_alloyteam-c5KV1bt8.ico";
const archiveIcon = "/assets/117_archive-S1m4Ixzb.ico";
const figmaIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABY0lEQVR4AWIYBYBmyiKrwSAIwkvkAjhcZfaRLbKacAFsH70Hegp09uhR+pEl1kzhNDKaN/nfq3j++lpqXBdVZ1W/Nmf69XmyYineXP1dWw3D61onmd9WZ1vS0A0gtK7bcZXX5jQMIgEkhAoGQNuzAWw0TDgADPIBUPj8sXSZAKCiI0Ai4uKXbwl1ZAznC8VQxrG2YAIBCG3nLcQv8TpYYmVl9laY9peZpd5/N3l8r6ZOnsz0yRNZMV5PHj3oJPO9JW4Jw18BJk8fWzD9Vcf3cSPYWWINA5dQpTSVmjxmFdN64wOAVrsA8JtgAA9zCAY+omAALJ0nAPlAhAMUHgGWUPkAIH4ugOg4HpSKoYzjf+N4/x2q/DIOwmt0J/kkHL3pqbGbnhm/6ZEVSyUb/G/ebUlDqUGaaxgUA0DbiwIIoyIANPQjwG8Gt4QXbeUCwKIWiiHMO5EnXEQcv4yD8BqHU677PwMP4q2FzfVzuAAAAABJRU5ErkJggg==";
const pinimgIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGGUlEQVR4Ac1aT0wcVRj/ZpblT4VmDRoL1GQpHtQLy0W9sSTtTS3Ui4kmXW9qYike6sEDS2IPelCoB49dEk28tKBXTQBv9cL2Qj20MCQiibVlC5busuyO329mt+zMvJn3Znbb+EsmwzzezPve9//73mrUAmxQMtFJsXGTtGEiM8lDKb4StasOw760fJXMmzGKL/fRHwY1CY0iwiZan2Si0/yYpggwyczz+3PNbCb0BhoIv0hODjcFkyinU3wm7EZCbWCbTk23mnDyEGRm+2h9Rn2+ArYpmaySvqCRlqKnA0Oj+JiKNHTZhG0aOm9SbPUpEg8kTSqv/kVD47KJgRuwVYZy9ARVJgBYcwE0BE3yVaGavmfpf4AguxBuwFYbi/PhF0scp7bkALWlXnGMV4wtKudvkVnYpShgQjN9dGdeMO4EDBY6TyHUBkR3T2aoY/w0xVOvBs6tGH/SwfLvtD9/je83KAQKbNgjbsP2bIANZ4NvSVJALHmSEle/pPb06xQF2MyDqctUWvxFaT4C3wCtjzhoaHywDUaTWj7wDHM88eMstb08RFGhs+S63n3Tuh/cyBMVS4Hz2ROe+JR6ta/p/vLRGNWJt1RngxQArndl3qFWAtK4N/a+dZegUKLK4CAZBTy0HY3HpkkBQcRX2UBLi79S+eaaZbTVBoONs1F3nj3jq25Qx96l7+nuyNsyQ0+0UxuygSweLAmocr9n+gJ1Zy94xsG1vZlv6VHumuwTFqH4xrHz54T/L7I97Ex8JPvMYynUAlksLXujvrAb8CbgmgrxgGW4mUsWkVUBpzvHz1iXBHUp2JGYA9ak9A1WHTf2Zq4wMZ9F8u1BnD7+zeey1xHcRnHXoT68hcA8B77drbvg5L/ZK9QMEAcezuU845B2h1wKaaT2uor6wGW6AY/hBjb57MJ39NzqzyyxryxCZAATRKrULVjTjTjFx/WKXf4FT3SlBeCc291Bb3uXfrDukFhX5pzlVRClgwDiH81f94y7UxGft1M6i2A4aAqCjPtj+64FMUekt5DAsYzY2zSiKIjE+GZcsgl2oUkYcTJokogTh/k1xzP01U9dZBKwv3eLxGsH51W8gWHpBkQouxaMK4nbH9WIGSojIa3IVBDE5bIPd1sE+QaQEjSDkClzaGADhaAJoiDl1ne/QAbiVYKc7iNBhcROvgHop5uL3mpLvNC+wD2K4OcyFaRv6Gj1yWYVf3K6OXciVuQMVARV9RHlPmCKXAKaoXOfclMyixO1646PdQa4zTrK+TUlFbC+d/a0Z6zEZacM6LHqXJJJJQA12pn42OHuGpM7kRs1C3ukAtQWImbsz11VeT2vF6myqDITHP2H02ZRGiEqUmLcmZABhPdMf+IZxxoq7hdNYaug4UJ+iSJ2mAHkQKJN3Bt7z9cOEDuQK4m6GH8PphXUz8z3c4FvxYFY8sUVigi4QL8yEWomSosx/3nOWEXEo8ZQsZ0qt+VxtySAvLrDLilDtxBBDCQQBNugtyy7aE+/5usA4M12Jj4kFXCPaBA9IquoR225RS/NcZWjVNiTawNuwNgbgxM4LWt4oTTdvXiZVICuYX+twfU4lTigw1mSBDUROka9G7jPxc5hiBxod+qLUKUpDkKO/q4BUjBrehUG7igKdcF1d+StQH2GlPY5vsBgH87mSBVMo+MUR9BaPMV9UbWzAKgFysdGgKgHH1xyjEHN6qoGLsMeSop5kgtGP90ZbBxoc8/QqDqh2tyFQbpxsOJ1m3ClLchK0dwdcw960uk+Mvh4h6ZIAe2jb3jGnlT6XGWaREdOwnqA+/A5jqTSgzY90eN4DpP/hAH0/iTTJPqfb0HzgvFbFi9SANwGfLAiT8DCAjQM0O2s3/+lp5S1gzZkVh6b6DNvO57VUgBlFKA2fpyvQ1pSstUvalTBoYIRNE+U5EUFDjJwGiMjHlAq6mHYcF8Qp18aAJ/fAhRslVkfUT2xD9WVgC5WjU344fnGTgQaU016H4twtMyD9F2EyD/2QFP4hLmR5j8nWfdT0dRHW+a8ZgVpTP3EJfQXqAWwO9yxNPqs+tFPbpINUwr2Zf3UZhNVIAqpqEQ34j9hL42mjjo9TwAAAABJRU5ErkJggg==";
const mikuIcon = "/assets/120_miku-DV4HU3F5.ico";
const dribbbleIcon = "/assets/123_dribbble-Be8tJ1dR.svg";
const bitcoincoreIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAitQTFRF/////4AA/6oA/4AA/5kz/4sX8pQb9JUV9Y8f9pUa95Ea95QZ95MX+JYX+JUc+JEc+JQb+JAa+ZUZ9JUb9ZIa9ZQa9ZEZ9ZMZ9pQb95Ua95IZ95Eb+JQa+JQc+JQb+JMa9pQb95IZ95Ib95Qb95Ma95Ma95Qa+JQa+JIa+JMZ9pQZ9pMa9pQa95QZ95Ib95Mb95Ia95Ma95MZ95Ma+JQa+JQa+JIZ9pMb9pQa9pMa9pMa9pIa95Ia95Mb95Ma95Ia95Qa95Ma95MZ95Ib95Mb95Ma95Ma+JQZ+JMa95Ma95Ma95Ma95Ma95Ma95Ma95Ma95Ma95Ma95Ma95Qa95Ma95Ma95Ma95Ma95Ma95Ma95Ma95Mb95Ue95Yf95Yg95Yh95cj95gl+Joo+Jsq+Jss+J0v+J0w+J4w+J4x+J4y+KA1+KA2+KE3+KE4+KM8+KQ/+KZC+ahG+apL+a5T+a9W+bFa+bNe+bRg+rhp+rlq+rpu+rtu+r1y+8OA+8SC+8iJ+8mM+8qP+8qQ+8uR+82U+82W+86Y+8+a/NCb/NCc/NGe/NSk/NWm/Nao/Nmu/Nqw/Nqx/Nu0/d65/d+8/eG+/eHA/eLB/eLC/ePF/eTG/eXI/efM/efN/erS/erT/uvV/uzX/u3Y/u7a/u7b/u/e/vDg/vHg/vHi/vLj/vTo/vTp/vXp/vbr/vfu/vjw//nz//r0//r1//z4//z5//37//78//79///+////pTiBTwAAAFp0Uk5TAAIDBAULExgZHR4fISIkJSYnKTAxMjM0OTw9QUVKTE5WW15fYWNka2xvcHR3eXx9gYKEh4qMjZCRkpOUlpmam52goaKjpqirrri72+Hj6Ors7fHy8/X4+vv+wETTwAAAAaxJREFUGBltwYdDjHEABuCX7L2z90ohZJQZQkaI4l4JUcku2ZFVRPYeHdLZo4zr/fNc3/e73/fdueeBX/+psxcsmzMhuTMS6ZW5iUbewmGI133FDvqt640Yo/MYpyAFPmkB/i8D1nRa++lZAmN8gNbLL3sqj9GYDEe3LXSVk8W/3/CpyukqGIQOy+na9f3rvTo1FLW9Z1QuIgYE6CoNtkv6+VqNtIYASKd1To6/t8to5ADYQOu0FKq68kFqq6ZrWxcMpKdeaiT3vZKCNEZgLD1N0nmSV6UfNGZhBq2SsFRXXXHym3SXRhYyaJ1R1KcTNLKRTuuG9PDS8z9S61FGrUUqraB0gTz4TAodopGJiXTtLTselg6TPCLpGo0U9KXrosLSR0ZUSrpOYwywkY5HimhvuV9787OkU3Rt7wospqv0bJOintDIBtBnJ40Xqnqg0Nt3zbdKaIxCxEq6dv9q5mNV0CcXHXpupePAnctFrS30KewHxzhGFdfU0CcVxlwmlAVrJhNY3QmeSfmMUzgNMXrkMMb6wYg3dNFmGvlrkpFI0sgp81YtnZ82PAmef3QeP0PAzgscAAAAAElFTkSuQmCC";
const torprojectIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABEJJREFUeNrEVl1sTGkYfmfVmvrpHFWZhm5nLvy0g5npBWqT1lRUY4M0IV2hbdoLMUIMF1z4t7Gb4IL6S5eLFmPZFZQSrEaaNlEt0RJCK+g0Km3pz5BGiTre55s5o1OtzJkO3uTJd87MOd/zvs/7cz6ib2D2otlGgH6EMbGNURDo85oQk+fw4mCkMNIZMxlr89NLOvp7JyxExNt4qWfsYWxnVDNAmvI18pAowORWXrYybF4ncF8TCDnspxAI4PCSS2rJB6wARw/S9h4/gTSByesD3WOgCth63aeoIQ/aAY1Gk84weqtcMVR7jdq9BgXpwGJezjU9csf9HB6mlWKGlTL5iu82bBD9/AVz5Cv/n5QtFpPM988Y1u868ZhQ7ux6Km/cvEY2jpoIJ2zB7BNsDUjKtbvjNWnDwvsqyG8WucQ4l5W9SH5YWyZSkBaXAQWCVkFt9bcnz0yUXzTXyIeP7BZACn5PWCGHDx4KJ/b0VCgkXeCN+qROF7Htjx3rtHn7d1BL80tyu9+QVjuE9LEStdV105y4DGrtbEps7Wy28/O1/OqjUERtRZVDakiOwgOQAqiAIsRqibfKW9LyBXqqMSAFvMOmIjNrYXTh8TzS60dz1K8pJ9tBqanJNHVaAjW4nlNX13uaaDJSeckdih7xC0UNi6ZxUZPoQdPtxG75A9JxNdjoqxGpEvW/p/+Wkf+KqkviHorgWqmJOP1nFYDlv25SlLCpVoBfyjEYYuyXr/4j7v/6cx/dqqqhU//lCyVgTucZknQRxM9RXe1TunGrkiZHzvDtMXxIBHV//ECu9jo4kKd2Djg2bFwtLk4cPyPW/MO7fH9eLL5GZrNJrEuzFlJ5eSXpx0ZSx9tWv02mGWZhThj7m5Rfc8A6b0GqyHkxkyjOwA4eKBADKCl5OsUaxlJ5WaX4HUq4u/wdwJAyRE4g7xEtMAeQM2zGbUdOjn7lqlzP1GNn5qYtYeJEETUM/53gVEwxx5OLC7IvQ2GyWVSdCREZDNEpDixftp527t7M0sf70gAlYtlZ1ALM1faYDCMn9LWlpCYF9Q2uRr8fQAbJFXK0H5xzNTRSUtJ0UQO93+m9Z8AOyLJcz3J2gMRsMdG9ew8FMr2yK12xYdNqoYDZ4pEfMESO/5K5vQ7LXbVFWOR0nqV581N9XQAyJXrkHDWikyKYuNFXiL0NXeFqEw4UqXXg6MH9BZzbESIyHa/oBpFnJkQL9kyPYnpPwfms7MklLKVQVZUD/EIpV/3exRl2ltohVDh0oFB0gqKCYnDOQx6jnA2E3X1RAeCknBvUgYSdWMu5L7QvWydaT+kEFCOKztMlN33yW8bM8CO/cP8YLnP7iz7Qz/H5lpZXGh61tmb+BL97914QYhzjk3yxuESMaCl8FP1mWkKN7md04cExqnJdB2kKlAzZQZRRgAOJ9/TjBxxKRg6NwnU1viOB7vtJgAEAHxwDVZNJYl8AAAAASUVORK5CYII=";
const chlIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURf///0NDQ9XV1W1tbRMTE+rq6vPx8fv6+iIiIgcHBzIyMldXV7CwsN/f36KiosvLy4ODg5CQkL29vf/i4vomJv63t/xjY8fHxzgRN6IAAAAJcEhZcwAAAEgAAABIAEbJaz4AAAFJSURBVCjPvZPbksMgCIariCAeYkwT3/9NF3No05nt1c6sNxo/gZ9DHo//W35KDekrzpEl+a/YGsflN0we0dPvmHxOFWD2O0Za1nV5K/CYIgfHEQ+8bM/n5i/ubXQhSG2nc1yeul7mlKMIlI6nNKR121a6RbY9iml04odflg99HqtzcDif8UG6PqXPLkQc2CnGqVt6JZzt1MAFUypwCCwizAK4YywQjbBqd8xj23eWeuAM42vcMwBoilxbS6nnwzvhNBHhiJ09WglcKJdarrIMlbs009FnE4JpkbWCpzVlm0rVazbJ++KCE+f0eDkH2ZUFjhqv8RAX+1UWwmpM1Lw47R3XUzDpXdLRaatGA/udBgefE5Xrbk0W2BmtHEO6Pxg9i11xNGD7qJ3M9t2VkfzruWYpGkHSrSf3HtGYHifl28CO2ZtT/utf8wMT5A/Euo4sVAAAAABJRU5ErkJggg==";
const pgyerIcon = "/assets/129_pgyer-DxWsaA31.ico";
const tumblrIcon = "/assets/12_tumblr-C2f8gay0.ico";
const ipinfoIcon = "/assets/130_ipinfo-Dged_HdA.ico";
const docsmallIcon = "/assets/131_docsmall-2FN_zmM_.png";
const designcrowdIcon = "data:image/x-icon;base64,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6wD07+UAk2oEAJdvDgCadBMA5NrBAOLXugDcz6wAtJdOAL6mZQDDrHMA9vPvAINUAACIWgAAjGAAAKF9JwCQZgAA7ufXALGSSwDr5NIA1cSaANG/kgDErXgAl28LAJhwEQCqiTsA1saeALOWUQC1mVQAtppYAMWweQC/p2wA///7AJx1HACvkEIA/v79APz8+QD59/EA9/TtAI9kAgCYcBcA5tzEAJ55GgCfeSIApoQuAKWDMwDZy6kAy7eGALidWAC6oGIAwaltAPv59QCHWAAA8+/jAJJnAACTaQYAkmgJAJpzEQCcdhoA3c+uAKSAKgDXyKEAqIc2AM26igC6oF0AvqVnAIVVAACQZAAA5NrDAOLXvAC2mlYAyLN+APz79gDn3sgAmXESAJhwFADk2b8A282qALGTSgDFr3YAwalwAP79/AD9/PoA/Pv4APn28AD49e0A9fLpAIlbAACLXgAAjWEAAPPu4gCSZwIAk2oBAO/o2QCRZwYAlGoDAJJoBgDu6NYA7OXUAOzl0gCdeBkAoXwhAJ96IwCifiIA286sAKuKOADVxZsArY1BANTDmgDRwJMA0L+TALGUSQC8o2IAvaRkAL+maAD///4A/v7+AP7+/AD9/PsA/fz5APz7+QD6+PQA+vjyAINTAACEVAAA+PbwAIRVAAD49e8AhVYAAIZXAACGWAAA9vPqAIdZAACIWwAAiVwAAIpcAADz7+QAi10AAIpeAADz7uMAi18AAPLu4gCMXwAAjWIAAI5iAACPYwAAj2QAAJBlAACRZgAAkWcAAJJoAADs5tQAk2oAAJNpAQDq488Alm4HAOPZvwCcdhkA4te7AJ55GwCfeRwAnnkiAKN/JgDYyqUApYIuAKaELQDWx6EA1MScAKqJOgDTwpkA0L+SAM+9jwAAysrKysrKysoOD8rKysrKERIQysrKysrKysrKysrKygDKysrKysrKyvtYnMrKykxY0NCUysrKysrKysrKysrKAMrKysrKysrKnK/FysrKR91Wr1bfysrKPyLKysrKysoAysrKysrKysrKLNALyspH3VavVt/KyspP+8rKysrKygDKysrKysrKyso20Fjfyt910NBzysrKb/nKysrKysrKAMrKysodgRffyhtW3ZLKyt9QA8rKynPQfcrKysrKysoAysrK31bd0HDKnEuv3RfKysrKyqkK0DvKysrKysrKygDKysqg3VZ7T8rK+XtW3Ts/ylT7ut3dNsrKysrKysrKAMrKylR10NAGyspPe1ZWe1ZPJ917r1icyvsK+8rKysoAysrKyrY0SMrKmXtWVlZWr3uvVlbdcMpI0N3QSMrKygDKysrKysrKyplYe1ZWVlZWVlZWVt1Hykt7VntLysrKACYDP9/fth1wr3tWVlZWVlZWVlZW3R3KS3tWe0vKysoAI7rde1ZW3d2vVlZWVlZWVlZWVlbdXsqb0N3QFcrKygDKyh2B3XtWVlZWVlZWVlZWVlZWVq+vHcppb0fKysrKAMrKysoddd1WVlZWVlZWVlZWVlZWVq97asrKysrKysoAysq1PJypF91WVlZWVlZWVlZWVlZWVq/duvvKysrKygDKfUrQdVTKAntWVlZWVlZWVlZWVlZWVlZ73UFpqcrKAMos3VbdSMr73VZWVlZWVlZWVlZWVlav3d3d0NBWxT8AysXQVtBpyizdVlZWVlZWVlZWVlZWe3UXxV4GxRf5EwDKG7rdO5xUSq9WVlZWVlZWVlZWVt1wnMrKysrKysrKAMrKnD3Kyl7dVlZWr1ZWVlZWVlavrxvKHYG6FcrKysoAysrKysq2Vq973XtWr917VlZWVntPyj173XvQSMrKygDKysrKyvnQeztHoLa2aU/dVlZW3RfKxd1WVntLysrKAMrKyspv0Bd9ysrKylTKyl7dr1bdlMpw3VZWr1icysoAysrKLBgrysrKylQCr1j7ykfdVt3Fyjbdr1bQcMrKygDKyvsCqcrKysrKF9Cve92dynPd3cXKysV73YHfysrKAMrKnMrKysrKylRKr1ZW3V7KyvnQcMrKyrZ9ysrKysoAysrKysrKysrKVEqvVlbdXsrKoNB2ysrKysrKysrKygDKysrKysrKysrKcNCve3udysrKO0vKysrKysrKysrKAMrKysrKysrKyspUF0p1+8rKysqZSpzKysrKysrKysoAysrKysrKysrKysrKysrKysrKysotGcrKysrKysrKygAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8=";
const prodIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADgSURBVHgB7ZeBDYMgEEV/mw7gCI7gCI7mCG6gGxgmQDfADdhANrBApWlCrK00nDW85MRgyP/xjgsAD3IdXMekY44Q3aL5FI8l/BqTM9ERiLvgl+WFCkVtAFcQQ27ghkCaprHjOI6o6xp7CKpkB+d81/pUA8lAcCPS9WdHpRSEEN73YRhQVdXq+uBt6MiyDGVZevNSyrfryFNgWN2jbdvOWyCwjxy7FZv89X3vzRdFYXP+K77+babtniYFycB/HkgYY5sd7lPSofQQBhQIMQYE6GDmkYP4cupMxLqkGmHuxO/GnEO28kuKrwAAAABJRU5ErkJggg==";
const developerwayIcon = "/assets/135_developerway-fA5K0eKO.ico";
const ioIcon = "/assets/136_io-DmbBXWX7.ico";
const geeksforgeeksIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAACMuAAAjLgAAAAAAAAAAAAD////////////////////////////////////////////////////////////////////////////////////4////////////////////////////////////////////////////////////////////////////////////+P////////////////////////////////////////////////////////////////////////////////////j////////////////////////////////////////////////////////////////////////////////////4/////+fw5P+Es3T/UJM6/1WWP/+GtHf/4+7g////////////4+7g/4W0dv9UlT7/UJM6/4SzdP/o8eX/////+Ofw5P9TlT7/ZaBS/67NpP+uzaT/ZaBS/1eXQv/l7+L/5O7h/1aXQf9loFL/rs2k/67NpP9loFL/U5U+/+bw4/mEs3X/ZKBR//f69v////////////f69v9loFL/iLZ5/4i2ef9loFL/9/r2////////////9/r2/2SgUf+Es3X9V5dC/0yRNv9SlT3/UpU9/1KVPf9SlT3/TJE2/0eOMf9HjjH/TJE2/1KVPf9SlT3/UpU9/1KVPf9MkTb/VpdB/sLZuv/B2br/wdm6/8HZuv/B2br/wdm6/4e1eP9SlDz/UpQ8/4e1eP/B2br/wdm6/8HZuv/B2br/wdm6/8HYufr/////9vr1//b69f////////////b69f9koFH/hLN1/4Szdf9koFH/9vr1////////////9vr1//b59P/////4/////3+wb/9koFH/rMyi/63Mo/9kn1D/VZZA/+Xv4v/l7+L/VZZA/2SgUf+tzKP/rMyi/2SgUf9/sG//////+P/////m7+L/hLN1/1SVPv9SlT3/hLN0/+Tu4f///////////+Tu4f+Es3X/UpU9/1SVPv+Es3X/5u/i//////j////////////////////////////////////////////////////////////////////////////////////4////////////////////////////////////////////////////////////////////////////////////+P////////////////////////////////////////////////////////////////////////////////////j////////////////////////////////////////////////////////////////////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
const courseraIcon = "/assets/139_coursera-Dhq_JIIa.ico";
const udemycdnIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABQVBMVEUAAACkN+2jNPGlNfCkNfCjNfCkNfCkNfClNPGdO+uhNvKkNvCkNfCjNPClN/GqOeOkNfCkNfCkNvCfQP+kNfCkNfCjM/WnNO+kNfCmN+6fNfSkNfCkNfCkNe+kNvCjNfCkNfCkNfCjNfCkNfCkNfCkNfCjNfCkNvClNvCqK+qlNfCkNfCkNfCSJP+kNfCkNfGhOeykM+6qMfOkNfCkNfCkNvCkNPCjNfCkNfCmO/C/cvXz4/316P3Gf/ayVfLlxvv////ozPu1WvOqQ/HYqPn+/P/+/f/etfqsRvGmOvD58v7arPmnO/C0WfPlxfvPlfelN/C8a/SnPPGwT/KzVvKzV/P79/7GgPbHg/b69P7pzvv16v2zVfL26/7nyfvDefX9+v/pz/v9+//AdPXVovjCd/Xs1Pzq0fy/cfSqQvGpQPEn81/kAAAAOHRSTlMADlmbyur6mlgNJp31nCUJjPuKCNPHGTHjLhjQzIHzlvRXmevp+fiYVQwih8YH4uUbLRXBhsiXVsnIqF0AAAABYktHRED+2VzYAAAACXBIWXMAAAHRAAAB0QEMkUzzAAAAB3RJTUUH5QkNFC0SvZu6NgAAAYNJREFUOMuFU+lawjAQjFAuOQVRqCIFqQgCnmgAxaiIciinNx546/s/gAnNlsuvzJ/Mzk6z2/02CKmY0ukFg9FoEExmCxrHtNWGVdjsjpG00zWDh2B0ewbzjllIZDLAvHP9/LwB1Gxu/wC4z69+D/n8IaE4OgaHqOQ9C0p8UjglPRTPzhVl0dkzuJSoVGa5SqVIj3JJ0QK9/+P9V9ntF7TOJSVVRVtiRawYDNBfNgcGHKTzg/mUaqDiao2XwJIF6bAmQkivbQgjAWi90Wg0GWlSUlfniZbVwrT5FiOt/l9gHEGytmFlsmFiCUHb4EUmbUMUmbUNqygmcZqhepuRK0rUUccQsoP5mpAbdt4Scgeaie2TkQf3hDzkMe48EvLEJTnOFsLNo2d69Uu3+0qPNy6tKSvn5WGBcLxzIZFUllJMceHjk+5b8eubh+sbsNZ+HzT10+78Ak9t9h/G1vb4JiTEwaeVDEjDaXknOfI6xeCARQrH/3nfsVA0HZHlSHp3L9ZX/wBnCLlE8zp46gAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMS0wOS0xM1QyMDo0NToxOCswMDowMCNC0swAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjEtMDktMTNUMjA6NDU6MTgrMDA6MDBSH2pwAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAFd6VFh0UmF3IHByb2ZpbGUgdHlwZSBpcHRjAAB4nOPyDAhxVigoyk/LzEnlUgADIwsuYwsTIxNLkxQDEyBEgDTDZAMjs1Qgy9jUyMTMxBzEB8uASKBKLgDqFxF08kI1lQAAAABJRU5ErkJggg==";
const wallhavenIcon = "data:image/x-icon;base64,AAABAAEAEBMAAAEAIAA0BQAAFgAAACgAAAAQAAAAJgAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHV1dWCFhYXMlJOT+Jqbm/6enp7/oqKi/6SkpP+lpaX/paWl/6Wlpf+kpKT/oaGh/56env+ZmZn6jIyM0XV1dmCLjIzNnZ2c86ysrP22trb/u7u7/76+vv/BwcH/wsLC/8PDw//CwsL/wcHB/76+vv+5ubn/sLCw/qKiovSSkpLQnZ2d+rCwsP65ubn/v7+//8TExP/IyMj/y8vL/8zMzP/Nzc3/zc3N/8vLy//IyMj/w8PD/72+vf+zs7P+oqGh+qWlpf+8vLz/srKy/y8vL/9MTEz/wcHB/9PT0//W1tb/1tbW/y4uLv9MTEz/mZmZ/8zMzP/Hx8f/wcHB/6qqqv+rq6v/xMTE/8nJyf/Pz8//zs7O/3d3d//R0dH/3t7e/9/f3/9KSkr/t7e3/9fX1//T09P/zs7O/8nJyf+vr6//srGy/8rKyv/Pz8//1dTU/9nZ2f+lpaX/bW1t/+Xm5f/m5ub/d3d3/5OTk//d3d3/2dnZ/9TU1P/Pz8//tbW1/7a2tv/Pz8//1NTU/9nZ2f/e3t7/3t7e/zExMf/m5ub/7e3t/6ampv9paWn/4uLi/93d3f/Y2Nj/09PT/7q6uv+5ubn/09PT/9jY2P/c3Nz/Y2Nj/+Li4v9KSkr/ZWVl/4yMjP+BgYH/OTk5/+Xl5f/g4OD/3Nzc/9fX1/+9vb3/vb29/9bW1v/b29v/39/f/yUlJf/k5OT/j4+P/4KCgv/w8PD/7u7u/zExMf/R0dH/4+Pj/97e3v/a2tr/wcHB/8HBwf/Z2dn/3d3d/+Hh4f9vb2//v7+//8PDw/9PT0//7e3t/+zs7P9nZ2f/mZmZ/+Tk5P/g4OD/3d3d/8PDw//Dw8P/3Nzc/9/f3//i4uL/4ODg/56env+JiYn/Jycn/9XV1f/r6+v/sLCw/15eXv/l5eX/4uLi/9/f3//Hxsb/xsfG/9/g4P/h4eH/5OTk/+bm5v/p6Oj/6urq/+vr6//s7Oz/6+vr/+nq6f9qamr/xsbF/+Tk5P/h4eH/ycnJ/8nJyf7h4eH/5OTk/+bm5v/o6Oj/6enp/+rq6v/r6+v/6+vr/+vr6//q6ur/5OTk/2pqav9NTU3/4+Pj/8vLy/7Nzc343t7e/eXl5f/o6Oj/6enp/+rq6v/r6+v/7Ozs/+zs7P/s7Oz/6+vr/+rq6v/p6er/5ubm/+Dg4P3Ozs/41dXWzNnZ2vLj4+P96urq/+3s7P/s7Oz/7e3t/+3t7f/u7u7/7e7u/+3t7f/t7Oz/6+zr/+Xl5f7a2tvz1dXVzd7f317b3NzM19fX+NbW1v7X19f/19fX/9jY2P/Y2Nj/2NjY/9jY2P/Y2Nj/19fX/9fX1//Y2Nj629razt/f32AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAA//8AAA==";
const unpkgIcon = "/assets/142_unpkg-CRv8cOup.ico";
const dupayIcon = "/assets/144_dupay-cxuRQfGv.ico";
const moriohIcon = "data:image/svg+xml,%3csvg%20id='Layer_1'%20data-name='Layer%201'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20695.92%20790'%3e%3cdefs%3e%3cstyle%3e%20.cls-1{fill:%236164ae;fill-rule:evenodd;}%20@media%20(prefers-color-scheme:%20dark)%20{%20.cls-1%20{%20fill:%20%23ffffff;%20}%20}%20%3c/style%3e%3c/defs%3e%3cpath%20class='cls-1'%20d='M251.05,287.24c-8.81-29.83,3.07-63.93,34.24-81,9.76-5.36,20.94-7.66,32.08-7.66h0a69.12,69.12,0,1,1-32.2,130.29,70.05,70.05,0,0,1-9-5.63c-90.68,56.36-169.38,121-224,182.39v69.93a43.93,43.93,0,0,0,22,38l304,175.54a44,44,0,0,0,43.92,0l42.64-24.62c-58.84-56.34-118.92-131.45-171.38-216.24a69,69,0,1,1,36.06-25c53.93,87.51,115.6,164,174.67,218.52l222-128.2a43.93,43.93,0,0,0,22-38V352.11C694.2,405.65,625.7,459.56,549.25,507.27a69,69,0,1,1-25.14-36c90.68-56.37,169.38-121,224-182.39V224.46a43.9,43.9,0,0,0-22-38L422.1,10.88a43.93,43.93,0,0,0-43.91,0l-39.88,23c59.38,56.51,120.1,132.24,173.05,217.83a69.1,69.1,0,1,1-41.74,34,68.07,68.07,0,0,1,5.67-9C420.85,188.38,358.5,111.3,298.9,56.67L74.15,186.43a43.9,43.9,0,0,0-22,38V442.4C106.11,388.87,174.6,335,251.05,287.24Z'%20transform='translate(-52.19%20-5)'/%3e%3cpath%20class='cls-1'%20d='M519.74,338.7a23,23,0,0,0,10.9,2.73,23.34,23.34,0,0,0,11-43.95,23,23,0,0,0-10.91-2.73,23.33,23.33,0,0,0-11,43.95Z'%20transform='translate(-52.19%20-5)'/%3e%3cpath%20class='cls-1'%20d='M274.08,458.58A23.33,23.33,0,1,0,285,461.3,23.31,23.31,0,0,0,274.08,458.58Z'%20transform='translate(-52.19%20-5)'/%3e%3cpath%20class='cls-1'%20d='M493.85,506.19A23,23,0,0,0,483,503.5a23.37,23.37,0,1,0,10.84,2.69Z'%20transform='translate(-52.19%20-5)'/%3e%3cpath%20class='cls-1'%20d='M317.29,291a23.34,23.34,0,1,0-10.83-2.68A23.06,23.06,0,0,0,317.29,291Z'%20transform='translate(-52.19%20-5)'/%3e%3c/svg%3e";
const pandaremitIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABQxJREFUaAXtmG1om1UUx5ukTQI1s/hS1E1H1bUWXNOXpFVLpSAoovODbA5RJuhkvnzx5YvgxKoDQVAQpFNQ/DarxbVz2yed1pEaa+2rL6iwirpZ64csI4HUJm383dk83NznPjdNyaDCEwjPPf/zcs85995zz/NUVbk/NwNuBtwMuBlwM/A/zoDHyfe+vj7v8PDwDvgN+Xz+q5mZmW+cZCuNt7S0dHm93ps9Hs/c5OTkUZ55pzm0AbS1tV21srIyhOOdkmLf7OzsSxJ9QYbhcPgV5t0vGY8HAoF7x8fH/5Iwa2gLAOfDy8vLx5DYYkn9N1jx+Xzbp6amflTwipEdHR3bs9nsDAZVv36vqam5e2Ji4jt1Mq8M4PxWnP8cTHVeiHlZlT2yfKXHzC3sq86Laa4hsC+i0ejV6pxFAbB0+xC4RBWS6N3SuKJD5vaQIJP9S5eWlh5VJ1UDqFcFFHqzWCUFqwjZ2dnZwGG9ooQxm39FAaD8qcHAT9XV1TdxBn4zyKybxSGdo/LcQhC/OBlhlWz+FQUwPT39Ecpvagz019bWtnOIJjW8ikEk51uS1EYQ76hGwV6nlB+24SogaErZ7UTbj1KI/8MEdlwndyEx7oIdzP0ecyRZmccJ7kRZ8/X29gYpa5eVpVRhYc7b5cIPk1ldyTLJF/Ha29uvZ6W2+v3+n8fGxk4XMUsQ3d3doVQqFWXLnBNbk2w73rYmU2UHIFqMoaGhnTj+JIZvLRjHgcFQKLQvFoudLWC6J3qe1tbW/Tyfhx9YlTmF/kGCeZdgzun0nLCyAujq6tqSyWQOYaxHZxAnYo2Njb2Dg4PLOr7ANK2CLHqa2/5B9vuXMmgarzkAzsN1uVzuhNgyJoPwdtIzfayT4WCKOv4Hf7+Ov4r9w6HdTeE4YpCxWEVl1EKVAc5fzFV+fA3OV7EKYUXdIsnuDRAm54VsgBt5gG0WtRQNgzUFQOZFXW4y2LFYBDluEcogGAx+T4AZBdaRQewMUoEu0jFlrGQAZOIujJl6FMsezh1g+xy1AGUQj8cTyOwCTissGylWO5FIHLAxFMAYgKg4GHpN0bGROPU3/zu4KV+wMRVAXIq0xq3IjyksG4nME5ybBhtDAnzS2DZMJpP3E8BjNkYxkGaiHpz/uhh2pubn5882NzcPLC4u3onUlc6SVT5sb1pYWHA80MYVwPmnDMbPs6gYL+P8D6XkVP7IyEiaur9XxVUaHx4QN7KKF2jHAFCKoFyqEqRo8t4uGCv3udocflZCz09VesRJxjEA3o7uc1Iq4CzvodHR0VSBXudzLQlw9MUxAJzR3rayk9T1fplez5gD/QmJOGPSZSeE6QI26WRMAdyoU5CwI3zymJXodQ3ZRlkCeLWEspcWplknYwogqVMQGBNmyNyzTvxy8bq6OnFRGpPBfNomr9ppMpyMs3Ti0tH9niZzp3QMmrXN6L2o4wmMyvOWunJUpBwX5kMc1pOIhFRdfJmvr6//VcUF7djMRSKRJvqfkzgjGrDzPwxlGTxH2XxjFdI+uHxEOxFRmeifoVu9lm51SeUJmveLHorHYea0XqTQyVGq99ChfqDTcQxACFNKxRe6vRhswtAcLy7vi5dvnSEZw5EO+qcYmPw2lcfGPQR/TJZVx+JFJ51OiznDyCfgD6Dj+FnTGIBqvBya4G8j+IM4sg1H/kT3GRz5sBwbG0JWZHRDOOI64WbAzYCbATcDbgY2Ygb+BeWExgg9NyCaAAAAAElFTkSuQmCC";
const chinalawtranslateIcon = "/assets/147_chinalawtranslate-DD9SfWP6.jpg";
const tutorialsteacherIcon = "/assets/148_tutorialsteacher-BL4PFN-T.ico";
const pixivIcon = "/assets/14_pixiv-CYiLI_3W.ico";
const afreecatvIcon = "/assets/15_afreecatv-CfR9-fCy.ico";
const twitchIcon = "/assets/16_twitch-B_prGrWx.ico";
const similarsitesIcon = "data:image/png;base64,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";
const googleIcon = "/assets/1_google-B89G92vX.ico";
const meijumiIcon = "/assets/20_meijumi-DdCgx40O.ico";
const bilibiliIcon = "/assets/21_bilibili-B4f0lnyN.ico";
const imdbIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAahJREFUWMNj+HpU4v9AYoZRB4w6YNQBow4YdQC6wKIm/v+u5mz/w1w5/h+aIwxmg3CiH+f/pzvE4HwQvrJaBIXvZsH2vyqJ5//nw+L/c8K5wGLdBbykOaAxg+c/AwPDfwlhpv9ruwXBbBDmZGf4f2SuMJwPwicWIviCvIxw9vI2gf9mOqxgdhLQ4VRxAAh35vHidMD2yYL/WZgh7AnFfHAHgEJudacAGH85Ik6eA9hYIQaDghQUEtgcsGuq0H8uDkYMB7CzIdQ3Z/KQ5wB1eWYwzQE0TEuRhSgHmGpDHBDjxfnf34EdzPa1YyfPAYYaLP8lRZjAbG9bdpJCIMmfE4xBbB9bMh1gBHSArSEbmA1K3bgcAIsemjgAlJhA7L4iXqwOqE3lgbMnliCiIBYYBaEuHJRFAcgBrdkQi9f3CmJ1AAwzMTH8PzpfGB4CrCwIucpEbsIOOLlI+P/0Kr7/Cxv5/99aLwpmr+4S+H9llQiY/Xi7GJgG4SfbReFsEJ4BxCD9IHPWdAuAxQ4DC7OpFXz/p5Tz/f9wUHy0Lhh1wKgDRh0w6oDB5wAAnyEaXz1l5ZIAAAAASUVORK5CYII=";
const disneyplusIcon = "/assets/24_disneyplus-BDeaYJeY.ico";
const claudeIcon = "/assets/26_claude-Be6NtRE2.ico";
const chatgptIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAAAXVBMVEX///8AAAD////////////////////////////////w8PDh4eHS0tLR0dHDw8PCwsKzs7OkpKSVlZWGhoZ3d3doaGhZWVlKSko7Ozs6OjosLCwrKysdHR0cHBwNDQ1DEVI8AAAACnRSTlP/ABAgYH+Av8/fK8K0XQAAAVdJREFUeNqNk9tywyAMRJc0TVNEaLg7YO//f2YHu5nQ5jI9rxxgNZKg1O79Aw857pVSUG+feMrnm4Lq58+NHfZ4yQFH3LAxZycYGeNJ4VxnNofH6DYHDZjKqRYnuCPy3LXIueSJ7fT3vm8JgF+YNABbF8FAP6CHubBYoBuyFAw4ToEOqTpAEpMAkRo3WtW2Cw46LDGxBZxpxgcsNuHcGAHJbJF2LACb0Kp1NQngKscv0vIjJL1eDwIE+qEGCsyWAUBIqTmgLBpXNCPgayqbEJAo+KIbQ4S1vtjtHBAo0Aw3wZDNAFKa88t8FfxYZ6js6RMnGzbB0Y6C0YGMefbAJkiruGGuGXRvSxdco8FAuTbPXlgEgZwtRk5ssg1VdWtvvMZvzpUlTVyHCp4Od0gsdWKWdagmPCGQtZJZP5lrQHzOcYx3xAEv2WP3evX+s7xK7Y94yMdhp9Q3UlUdNidG8OcAAAAASUVORK5CYII=";
const devvIcon = "/assets/28_devv-6CCQHXRs.png";
const midjIcon = "/assets/29_midj-BQsNVmy5.png";
const youtubeIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAMAAADQmBKKAAAAY1BMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/n5//UFD/v7//////r6//ICD/7+//gID/z8//QED/EBD/YGD/MDD/39//j4//cHD4kZUHAAAAEXRSTlMAQDAgcIC/z//fn1CP72AQrwn+WewAAAIUSURBVHgB7dtVYuAwDEVRQ+wonDLD/lc5JQ2V68D90FnBC5hlZ4wxxhhjjDFI/kPBrSR676v0ID+p5fua/KRNDyr/wP2A71Kf8yAr0JB9Gn10XzCNbSObqdvx41Sxlc3N3r1namUXObg3dYPsJbk3tLKjeaLkUfVEyaNa949edle5v3jZ3xDdH40oxkerBCFSXpDqKX+QajRQEggdQrIoSMsXBWlnQShq92QUDNg/rX/1LBgdq5HpRE04WlqgrK0e1e69gBQFOjiUxRV1Q0fHJ6eysFAW6PjsXJblywI9uLhcPNBcEujBwdXCPWMuCvTg7BoTSB3dYAKp8ytZRF8cSN0eLjZ2SGEgdXLKCqSdEiaQdkqoQOWdUrNwoPJOadFA2imBAmmnBAuknRIjkHZKnEDaKZECFXRKzsXlA6m7K8AbKuiUqIEC/5Mt/1Mjmv29dYwfDR0ffS0bXI9OpQB7ggaYwgptkl/zl0GAhSJuKY3abMi07ZieuGGF29JDbXpW7G1hwMa5px0tROLhSxAQ3AEeMxDuEHgWjIpWSOBppRYRVowy0Mp1Mq2gKdFKvrxjVTQNtLLBllZYGbilp7ziXEJD62AF3glWAt86xSg6H1nXKBrPumjSTx9cxRlkY0MbUZeVOvcVfkxtzrKeJueUuvCje3ZdejD/6L6bqvOjOT0YvffRLS/6TwVnjDHGGGOMMUS/AGK4yDuptRxGAAAAAElFTkSuQmCC";
const forefrontIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHpSURBVHgB7ZdNigIxEIXLYXYudC/oXtG9iHv/9iK6FvECogdQvIGuxRuIHkC9gOK+u0/QfYIMryAwo206yTQ0Qj8ItBqTrypVL5rJZrOCEtQXJawU4HMBTqcTPR4P2mw21Gw2yVZWANjQdV2qVCq03+9psVgwkA3IN1moWCyS53n8fD6fqd1u8+YAgZbLJb8fCwAWxsCCctEgCF7mhYFMJhPOlFIwonejXC4Lx3FEv98Xu92On8fjMX9WKBSE6rutVovn1+t15TxlDSDVl8uFDocDR9PpdDhCFF+326UoIVNh2fotoyJEOp9BhsPhnzn5fJ7W6zUfw2AwiDwCqy54B4Ln6/XKUaMeIs+fLLug1+vxWK1WDFIqlWg+n3P0iPp2u2mvZQWQy+V4wIQQpQSxkbUT3u93TjOMCCAYyESsADhLRKqS7H8JAkc0AVEC4CyR4udqVxkRXBAQUeBaACiq2Wz2Uu3wBWwUplqtRkKIyP7XAqhWq7TdbrX6H2lH5DCvRqNBujLqAgki2w5mg0zgNdoS2dK9hKwApJBeCTKdTvk1suP7PpnKCgD3ADZH9Ij6PzL2ARTmaDTSstnYAVCAx+ORuwB9H4e0jgBRo+jQYjo3nIkijQitiBsOP8F0bzgTZdK/ZpSwUoAfIPMpFzHUfvsAAAAASUVORK5CYII=";
const poeIcon = "/assets/32_poe-BnTQpf12.svg";
const kimiIcon = "/assets/33_kimi-CW6fStlw.ico";
const feloIcon = "/assets/34_felo-DoSUuPLu.ico";
const consensusIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFGklEQVRYw8WXT2xc5RXFf+ebN2OPx3/ikIQ4hCSINmDaJNCGEkiEQEIKhUooi2QBC2DDAlWqUtZdVOoyKGJZwQYJBA2oQSptVYk/QQo0qLEtUGhISEElKEkhxn+wPfbMvO908V6a8XhSGzDiSW/z3ve+79xzzz33PvieL32dxZ0HvwqGsnG37S6gBBTy16lgTlIVNC2Ymd3fE5cFQPHJyQK4F1grsQX4iWEQuBqo5MumBGeBfwEjNieA86DJ+hO96TcC0HlwTEadtjba3APcJ7EZWOHs4BIQLjEAzAmqwITNaeCv4DckfxxEdXZ/v5cMoHRgsmDiCgLbBQ/auhMYkOhYCms2c8AX4GHJTwPHEGO1/f3pogBKByYL4DWG+5EfRmwV6vm6msmhTAPvgZ9F+nMI4cLsry6nRO1oT1OtBO1B/BIYRJT0rbTuGnAa9HuJF8vE0fE8HaF1aTRl5NuQHwEG9a0PB1AJdAN4L46b6pcrh6RV7Xa8DngMcXMusnYJbgATwASi5ozJkqALWAFqp5MisN4wkMIHQGMBAHAZNAjuE1wAdwI9oO6MLUdgHPgI/BrwNuhc/u4aYBC023gr6Co1M2ynTaDTtgwUiKmCT6nQ+B2iq1FPBiD8FLwL2ACMgV9FHMKcAsaCXMt3+xB41/Y7Rg/I3g0MgDqQU+Ac+BXgzKXo54lwx8hh1WeKFaI2Jkl9bYTSzHT36OiFa2pjF9f8wDHszU3m+QBnOkVtvLWuD44pmFKA1cEMgm4DbUBMQXwX83fgXO2J/oUAbh9+uYzjHYLHMyoJwCc2fxq9sO7Nf58Z7FMMFwVnq7/un1vMwGKkA9SD1IloQJwKMDPb4gP/S4EcVwEPAncL+gEMmwQDq64+P15IGn/79OS2iSKk1UU0nzvebH7/3ytpoqILuAnobXrWAVyP/POVqz5/++T+/tHl7oZhngahu6m7XUJRRmxGVO4aOazvEoCBdu2zgOnDrEjTtPBdAmhkZUa9jfOUsTfYsXO5ASQtfn0eqIGKLesqiG3Gb901cnj6yC17vNjGdwwdKmQmRiUPdCqgqSQkjebvm5yKKuYUZqbN1NCLuBvppoYbi7bjnUOHisAmYB/wG+C3wEPGW9OYztNSUxkybTiBGANWze+UKube8KjtyV3DL32QKKm2MrFj5LDkRtn2ZuBh4H5gTR7oPYbhSHyKyDGywaU5BaGKfAI4CVwLlFsC6wHuBcq2n6278d7OoT+MO1ArEAyxFF3vjWYr8IjgTmB1E8s9+Z4fR+KpBQCO3ro37jz+0jT4S0yjzeghYCWwG7gBfBQYInI+4jqwDrxFaBdwY17Srbt0Az9sDi5pps9pvQys1ZXacLZhJU/HesMvgDmwyUyroizS5AqDyVTejKoLNRBjEbQOvJErA2gWb59Q35Jnokzcw5JfDVm5z6+CYHcKXw/0IpbV8S4djnkaM1QInmvnA93AzcrytDwHZ846DvwD8wzWm7Ymj2zfFxcCkLsycdG1YB+7muWaDqTyEqZj535yDjgCPJdNxnz1zs/2xbZO6Mu9oK7LG0znEZwm++tZbzwI9IMqyua8pPnHJBfYKPC+4C+GY5I+KxaSuXYO2qzWMeCPmRVTAv4JnMhGLf1HdtWBivEGoR8JfgxclQ2hmdUCn2XzIscRZ2VdlJk5un1vuoRewATwMvB6TvGMYCqoUA0hNI7cssc7Rl4QUZ8Cw7lWkvxWxoDmsu80lYRCfSk943u//gtMLRNM57T+QgAAAABJRU5ErkJggg==";
const geminiIcon = "data:image/svg+xml,%3csvg%20width='28'%20height='28'%20viewBox='0%200%2028%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M14%2028C14%2026.0633%2013.6267%2024.2433%2012.88%2022.54C12.1567%2020.8367%2011.165%2019.355%209.905%2018.095C8.645%2016.835%207.16333%2015.8433%205.46%2015.12C3.75667%2014.3733%201.93667%2014%200%2014C1.93667%2014%203.75667%2013.6383%205.46%2012.915C7.16333%2012.1683%208.645%2011.165%209.905%209.905C11.165%208.645%2012.1567%207.16333%2012.88%205.46C13.6267%203.75667%2014%201.93667%2014%200C14%201.93667%2014.3617%203.75667%2015.085%205.46C15.8317%207.16333%2016.835%208.645%2018.095%209.905C19.355%2011.165%2020.8367%2012.1683%2022.54%2012.915C24.2433%2013.6383%2026.0633%2014%2028%2014C26.0633%2014%2024.2433%2014.3733%2022.54%2015.12C20.8367%2015.8433%2019.355%2016.835%2018.095%2018.095C16.835%2019.355%2015.8317%2020.8367%2015.085%2022.54C14.3617%2024.2433%2014%2026.0633%2014%2028Z'%20fill='url(%23paint0_radial_16771_53212)'/%3e%3cdefs%3e%3cradialGradient%20id='paint0_radial_16771_53212'%20cx='0'%20cy='0'%20r='1'%20gradientUnits='userSpaceOnUse'%20gradientTransform='translate(2.77876%2011.3795)%20rotate(18.6832)%20scale(29.8025%20238.737)'%3e%3cstop%20offset='0.0671246'%20stop-color='%239168C0'/%3e%3cstop%20offset='0.342551'%20stop-color='%235684D1'/%3e%3cstop%20offset='0.672076'%20stop-color='%231BA1E3'/%3e%3c/radialGradient%3e%3c/defs%3e%3c/svg%3e";
const chathubIcon = "/assets/37_chathub-BzhQm69B.png";
const aminerIcon = "data:image/x-icon;base64,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";
const shejiIcon = "/assets/39_88sheji-cTfR_eqY.png";
const mailIcon = "/assets/3_mail-NQ0NRfhv.ico";
const yibaochinaIcon = "/assets/40_yibaochina-Bp-Szywy.ico";
const rfiIcon = "/assets/43_rfi-DGrUPwBM.ico";
const dwIcon = "data:image/png;base64,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";
const timeIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6tpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5QjdFMUM4NDQ2NzgxMUUzQTEyOTgxODc3NzdEODgwMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5QjdFMUM4MzQ2NzgxMUUzQTEyOTgxODc3NzdEODgwMyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBJbGx1c3RyYXRvciBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0idXVpZDozZWY4MzY1Yy1mMzkzLTM0NGUtYmEyYi0zODM1M2YxOTk3ZWYiIHN0UmVmOmRvY3VtZW50SUQ9InV1aWQ6NDRjYzg1ZDEtZWVhYy1hNzRmLWE3NGEtNGIzM2E5ZTY2OWE0Ii8+IDxkYzp0aXRsZT4gPHJkZjpBbHQ+IDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+VGltZTwvcmRmOmxpPiA8L3JkZjpBbHQ+IDwvZGM6dGl0bGU+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++QXaIQAAAGJJREFUeNpi/P//PwMMfOXlRXBoCLg/f2aEsZkYBhiw4HMdPoAeWuTqG/AQGHUAEznxSK0cMBoFow4YdcCoA0YdMOqAUQeMOmDUAaMOGHXAqANAgBG5e05qx5LYzgc+ABBgADWLGh9h+2/XAAAAAElFTkSuQmCC";
const cnnIcon = "/assets/47_cnn-BLT1NLRa.ico";
const bbcIcon = "/assets/48_bbc-DD-7EOox.ico";
const reutersIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP91AID//wCA/5wAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/MwCA/8AAgP9CAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/AACA/wAAgP8AAID/GwCA/6sAgP9yAID/AACA/wAAgP8AAID/AACA/wAAgP9CAID/vQCA/ycAgP8AAID/AACA/wAAgP8AAID/AACA/34AgP//AID//wCA/x4AgP8AAID/EgCA/yQAgP8AAID/kACA//8AgP9UAID/AACA/wAAgP8AAID/AACA/wAAgP8tAID/zwCA/6IAgP8DAID/DACA/+0AgP//AID/SwCA/wYAgP8zAID/AACA/wAAgP8AAID/AACA/zkAgP8hAID/AACA/wAAgP8AAID/AACA/wkAgP/wAID//wCA/1cAgP8AAID/OQCA/z8AgP8AAID/AACA/3sAgP//AID//wCA/1oAgP8AAID/XQCA/8kAgP9dAID/JwCA/0IAgP8AAID/DwCA//wAgP/8AID/AACA/wAAgP+3AID//wCA//8AgP+WAID/AACA/+QAgP//AID/5wCA/wAAgP9mAID/mQCA/yEAgP+WAID/nACA/wAAgP8AAID/PACA/+0AgP/MAID/KgCA/wAAgP9+AID//wCA/5AAgP8DAID//ACA//8AgP+BAID/DACA/wwAgP8AAID/BgCA/w8AgP8AAID/AACA/z8AgP/AAID/eACA/wAAgP8AAID/AACA/34AgP+9AID/MACA/7EAgP/SAID/PwCA/+cAgP/2AID/eACA/wAAgP/eAID//wCA//8AgP8nAID/igCA/8AAgP8bAID/DACA/zAAgP9OAID/YwCA/6sAgP//AID//wCA//MAgP8AAID/rgCA//8AgP/kAID/DwCA/8wAgP//AID/PACA/3UAgP/wAID/AACA/wAAgP97AID//wCA//8AgP/AAID/AACA/xIAgP9IAID/GACA/wAAgP8YAID/PwCA/wAAgP8JAID/IQCA/wAAgP8AAID/AACA/0sAgP91AID/DwCA/34AgP//AID/vQCA/wAAgP9XAID/bACA/wAAgP91AID/bwCA/wAAgP8AAID/AACA/1oAgP+ZAID/WgCA/wAAgP+9AID//wCA//wAgP8JAID/3gCA//wAgP8GAID/CQCA/w8AgP8AAID/AACA/wAAgP//AID//wCA//8AgP9FAID/OQCA/7QAgP9mAID/AACA/x4AgP82AID/AACA/zYAgP8AAID/AACA/wAAgP8A/88AAP/fAAD9/QAA/PkAAPzPAAD/zwAA53wAAMI0AADnIwAA/fQAAJifAAAImwAAj/8AAPn/AACxPwAAG/8AAA==";
const wikipediaIcon = "data:image/x-icon;base64,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";
const quoraIcon = "/assets/50_quora-BAfpbcGO.ico";
const grIcon = "/assets/51_gr-Cw6QpP7W.ico";
const vuejsIcon = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cstyle%3e%20.st0%20{%20fill:%20%2342B883;%20}%20.st1%20{%20fill:%20%2335495E;%20}%20%3c/style%3e%3cpath%20class='st0'%20d='M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z'%20/%3e%3cpath%20class='st1'%20d='M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z'%20/%3e%3c/svg%3e";
const reactIcon = "data:image/png;base64,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";
const vitejsIcon = "data:image/svg+xml,%3csvg%20width='410'%20height='404'%20viewBox='0%200%20410%20404'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M399.641%2059.5246L215.643%20388.545C211.844%20395.338%20202.084%20395.378%20198.228%20388.618L10.5817%2059.5563C6.38087%2052.1896%2012.6802%2043.2665%2021.0281%2044.7586L205.223%2077.6824C206.398%2077.8924%20207.601%2077.8904%20208.776%2077.6763L389.119%2044.8058C397.439%2043.2894%20403.768%2052.1434%20399.641%2059.5246Z'%20fill='url(%23paint0_linear)'/%3e%3cpath%20d='M292.965%201.5744L156.801%2028.2552C154.563%2028.6937%20152.906%2030.5903%20152.771%2032.8664L144.395%20174.33C144.198%20177.662%20147.258%20180.248%20150.51%20179.498L188.42%20170.749C191.967%20169.931%20195.172%20173.055%20194.443%20176.622L183.18%20231.775C182.422%20235.487%20185.907%20238.661%20189.532%20237.56L212.947%20230.446C216.577%20229.344%20220.065%20232.527%20219.297%20236.242L201.398%20322.875C200.278%20328.294%20207.486%20331.249%20210.492%20326.603L212.5%20323.5L323.454%20102.072C325.312%2098.3645%20322.108%2094.137%20318.036%2094.9228L279.014%20102.454C275.347%20103.161%20272.227%2099.746%20273.262%2096.1583L298.731%207.86689C299.767%204.27314%20296.636%200.855181%20292.965%201.5744Z'%20fill='url(%23paint1_linear)'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear'%20x1='6.00017'%20y1='32.9999'%20x2='235'%20y2='344'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%2341D1FF'/%3e%3cstop%20offset='1'%20stop-color='%23BD34FE'/%3e%3c/linearGradient%3e%3clinearGradient%20id='paint1_linear'%20x1='194.651'%20y1='8.81818'%20x2='236.076'%20y2='292.989'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FFEA83'/%3e%3cstop%20offset='0.0833333'%20stop-color='%23FFDD35'/%3e%3cstop%20offset='1'%20stop-color='%23FFA800'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e";
const leetcodeIcon = "/assets/56_leetcode-D8G7VAuZ.ico";
const quasarIcon = "data:image/png;base64,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";
const mozillaIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABX1BMVEX///9HR0tTU1chICZGRUpDQkdEQ0gVFBrOzs/My80eHSNRUFT+/v4YFx0WFRvw8PE7Oj/29vb8/PwuLTLl5eZLSk8aGR6Uk5be3t8kIyh0c3b5+fkzMjhzcnaEhIeIh4pWVVrNzM68vL3Av8H5+fo/PkNnZmqvr7HQ0NF3d3p9fH83NjtjYmYjIierq601NDmfnqGOjpHr6+vX1tcnJiykpKZcW1+Qj5LFxcbW1tdsbG+1tLbg4ODY2NmgoKI8PEGYmJpYV1xSUlYxMDVQT1MbGiA/P0Sbm53S0tM8O0CsrK5xcHRpaGx5eHzj4+SxsbPs7OxgYGTCwcM2NTpOTVKpqKu5ubvy8vLt7e1/f4L6+vtIR0ynp6mDg4ZCQUaurq9MS1D09PTIyMleXmKKio23t7lHRkqrqqzT09T9/f2ysrTNzc5iYWVvbnJpaW0sKzC7u70pKC56eX3CwsQmJitiaC63AAABV0lEQVRIx+3VRVMDQRCG4Xc3sAOEEEhwEtzd3d3d3d3h/xeTymbn1lVcIXOaPjzVffh6BvXLQxL8DeCzbfvc7/e5ZbZtb/v9jgCW4OIJUtxyHs4gTQC78JjugalMKBZBRg68GrACwVsRbEDo24BNuEsVwQ58KQ8UHcKzCAL78GnAMpT4RDANRAxYg3clgnG4Vx6Y2YOoDIbh2oAJeHgTQY2e6NSAUUhXIiiD1SwPZOXCiQzqYU55wNL9skUQ1kGYNKAPCpUIGnQQ8g0YgQIZVEGr8sCWnihPBC3V0GzAAXQGRFAbC4IBl9CjRFAHlcoDHyHoFUF+UC+LAS+QkyGCcsgMG3ADQ0oE7VChPBBbvUERxIJQasCVXr1uEaTEg5AAx9CvRNARD4ILjtahUQZd8SC4IKr7NYmgzQ2CCxZhQImgyHGcgHtfsKxZx4kknirLGkt+KP8Q/ABoHVFTkXMUNgAAAABJRU5ErkJggg==";
const betterexplainedIcon = "/assets/61_betterexplained-IzIjXlfA.ico";
const ycombinatorIcon = "/assets/62_ycombinator-BKgnNJSQ.ico";
const codeprojectIcon = "/assets/63_codeproject-byyuYu1l.ico";
const javascriptIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABOJJREFUWAnNV11Mm2UUPufrB7Rdx0b/psBGy43OTRMzXbhhW/gJU1xw0cxEZyJZ4qa7NPHGGZjTW83ixa7M7nRDk2lAhPGjGVlMnBdcmGmGawEzpny1/lBW/vq9PucrJaW09CtXngTec857fp73nPe8bYkKUL+3praHal0FtktSS5xBb/XufE5aPqXoEvF7933B8g+HvXseK2RjRz/kq9vrD5Z/9H185r4d+3U2UoXRQP30cCB8at2GTWEkEOoU/0KnlzBcJBYjQC+s2hXRpwnz3zMdsdhcER/qCQQ8PvZcYuKTStE3zUakHT4IsZEKtmDVVC0kH3Qqpe4A6cvbNM8bG0Ns1CD5mdXkEyvJ+ddgkTe5eBYDQM8mfjeU4vfEmJX2+qBnV1D4QtS7vdrPik9b+6wutCX+mC1kK/qiAMTobizSY5K6gIOEypzudHDZyENuZ8VpRSqMqn3w62z0Sh6TratGfOGDo4HwF4XG8zKFnLI/5A012M2ydgm/8vu3u5WnSSM1t2Kas44l3YjPR2MniFLZwXqp2u3y6qGW+PTtbL3wMrLJ+MrkMZp5kL3XTaQ3+OsCekoLkMZBZuWajqmhTppcWAMgDtd2hnZWlvGrUF4kZibUUTGfbZ6NXMoOKPyQv77dwdQN9lH8/ZJS1N0ai3wNfh2N+ENdCNVlxSO1QIrPxmiu54RhJMRwHQBR9BCVV/lCzzgcfAjGh2FxAD39AVC6WozJAbGxkmvUJ3w2pUx6LgNiOBB6iVl7BwkexwzcxBiMMaXGbhhTA91EZsZvA4DMhqyDVbv36w79bZygHiBmEOTjFiM6hrfhFoA9hRm/hzp9gvUU1hok+rHJiDyN5Ecxhm8ieKUijtKy6m7+OzqVHXtLvFRHHAFgbjRYr/B33pKxWjL0ImfshC9Gm1agkHOmAjhxDKP5Ezq5HxXxZypQyC+f3tY7kOtoKrJObiVlPmKtMJKLmGtbTN5SBSQoSo6T075MAtyP25iWNTmjL7ZuqQID/rqHMRV7JTjWz2VlyKIXvhTaEgBdcxzHZODNosRKavEtgDBlzstYe6GU5GK7JQCs6EVxRtmvt8VnfsMI3hIZ/bT0wtulkgH0ex4KIPUhKwGr2uGq8BOmqfpFBqDG4W3hXXaTi13JAJxOl5TfIc54bA5qOo1DbrZktIVd6rjwdqlkAIop3WelxpWZOoDPii9R+kacf16SsqaV1IaSAAxU1npx6iZJhHL3jcWmxnH/ruK5ncDnhvW+40IekS8lYmOHSgJQVqF3oO66BEY+1RgI/6yxdgUzWGMqNSp6aY+7ouJ54e1QSQCY0mMmY6eR412UPgj+fZVcqotz4iSqsihJMRW222AbwFBV/Q70vzWdQN4AfFUgilqyS3+EDCOJx+g7kQGhqW/Hnqo0v/l/2wBYU8eQ0Po0VCm6iMv3mcm0ByU/x+S46Q+EDSRO956pzFWudWyeOr1rH4CDrduPMi/9qc2dw7v/ythsNLicMhugO49yTOA7w5OZpGiXrTbgUMVJfmj42SMndKLy15uNaFs+L3mknG73t9jbJ0DNZQq2/hX5J59tRmerAj7Tjd6zc9WpN+Ocu6Z/Q6hropd2sW4ezbXJla2RylXmyrjzd0lTN3C9VxaTyau5+9myWkpdpnLHYbwX+MhQd7L3/pf8f/6FtKrXKFq9AAAAAElFTkSuQmCC";
const rabbitmqIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Created%20with%20Inkscape%20(http://www.inkscape.org/)%20--%3e%3csvg%20width='500'%20height='500'%20viewBox='0%200%20132.29167%20132.29166'%20version='1.1'%20id='svg1'%20inkscape:version='1.3%20(0e150ed6c4,%202023-07-21)'%20sodipodi:docname='logo-rabbitmq.svg'%20xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape'%20xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:svg='http://www.w3.org/2000/svg'%3e%3csodipodi:namedview%20id='namedview1'%20pagecolor='%23ffffff'%20bordercolor='%23666666'%20borderopacity='1.0'%20inkscape:showpageshadow='2'%20inkscape:pageopacity='0.0'%20inkscape:pagecheckerboard='0'%20inkscape:deskcolor='%23d1d1d1'%20inkscape:document-units='mm'%20inkscape:zoom='0.7338665'%20inkscape:cx='-150.57235'%20inkscape:cy='293.65014'%20inkscape:window-width='1916'%20inkscape:window-height='1029'%20inkscape:window-x='0'%20inkscape:window-y='0'%20inkscape:window-maximized='1'%20inkscape:current-layer='layer1'%20/%3e%3cdefs%20id='defs1'%20/%3e%3cg%20inkscape:label='Layer%201'%20inkscape:groupmode='layer'%20id='layer1'%20transform='translate(-76.200105,-115.62292)'%3e%3cg%20id='g1'%20transform='matrix(3.3139169,0,0,3.3139169,76.216727,114.23118)'%20style='stroke-width:0.0798401'%3e%3cpath%20class='cls-2'%20d='M%2039.42,17.37%20H%2026.65%20a%201.59,1.59%200%200%201%20-1.6,-1.6%20V%203%20A%201.59,1.59%200%200%200%2023.45,1.41%20H%2018.67%20A%201.59,1.59%200%200%200%2017.07,3%20v%2012.77%20a%201.59,1.59%200%200%201%20-1.6,1.6%20h%20-4.78%20a%201.59,1.59%200%200%201%20-1.6,-1.6%20V%203%20A%201.59,1.59%200%200%200%207.49,1.4%20H%202.7%20A%201.59,1.59%200%200%200%201.11,3%20v%2036.72%20a%201.59,1.59%200%200%200%201.6,1.6%20h%2036.71%20a%201.59,1.59%200%200%200%201.6,-1.6%20V%2019%20a%201.59,1.59%200%200%200%20-1.6,-1.63%20z%20M%2033,30.93%20a%202.39,2.39%200%200%201%20-2.39,2.4%20h%20-3.2%20a%202.39,2.39%200%200%201%20-2.39,-2.4%20v%20-3.19%20a%202.39,2.39%200%200%201%202.39,-2.4%20h%203.2%20a%202.39,2.39%200%200%201%202.39,2.4%20z'%20transform='translate(-1.11,-0.98)'%20id='path10'%20style='fill:%23ff6600;stroke-width:0.0798401'%20/%3e%3c/g%3e%3c/g%3e%3c/svg%3e";
const dockerIcon = "data:image/x-icon;base64,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";
const confluentIcon = "/assets/67_confluent-CsSC4IgC.ico";
const grpcIcon = "/assets/68_grpc-BCVcqZVf.ico";
const webdevIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAgCAYAAACcuBHKAAABMklEQVR4AWIYXKDgvwBD2v96IAa0XwcaCANxHMf3AhGAQCAggiDQCwQCBR3cNQEEAg1BRBQoKOgJAoEBUJseYY/QI/y6y62Kqf/JdsnwhcE+/nf+s+hWH77DwbIGnGVIaJyJQU8AKnsQPQWrEH0PYBeiLqEA7EJcNCmA9CECXqqQHJJDcggHsw+Ri+8XtmqU1iR6didhAlC5YFYBsm0O+C/AVAJaAqDWmCDiIRil+hrM4ToX5URAKDAOBEBtNwNEQKsyS5zg/AVw5KiZADYLOqC6fHuU3h0RyAVDBaxWdEDX/3ifLuqfJz6KiA6g19oTLvYANSLCHKBqHwwQJ3k2NIB5heHb78zjY3dmKIbywfcAoyO5OFxP4Q5xUQ7k4okxhxGw3HwHiOv4QMl7enkf/jPgCtFeczBumsIuAAAAAElFTkSuQmCC";
const facebookIcon = "/assets/6_facebook-DKAWQCQR.ico";
const zbarIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAIlJREFUOMulU1sShDAIC9U7yhE5pDPxwy6T0XXpWn4aHkmhU4wk0c3M8HHNDABA8oaFgjWRO6KfAE6s8WtNnNGGWaOYugDST7xtDIDc96wb7iDUWZaE7V+yX3K1gAsl4pZub28uBUbIzwJF278FhOwDD9zetF2PULT9XUDn7n8+HrDWTu+Cza7zAelLZllbyvYIAAAAAElFTkSuQmCC";
const bookstackIcon = "/assets/71_bookstack-fKNlhxye.ico";
const stackshareIcon = "/assets/73_stackshare-BGzcsySM.ico";
const scihubIcon = "/assets/74_scihub-CuPlkNFr.ico";
const patternsIcon = "/assets/75_patterns-CAhKVg5B.ico";
const animistaIcon = "/assets/76_animista-DnjiLu3Y.ico";
const oktenIcon = "/assets/77_okten-PPtkSyxf.ico";
const ledgerIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAMAAABOo35HAAABCFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzxr8JAAAAWHRSTlMA3//Ho7LaF/A7Xt7x7OaesRPgpsyd6OfqUJG5EO1JR0RRS6/KPEIl9bi/q7Xdzxo+QDRgyQd0BOPhPzhkXQ0Y7wHBoJkMp5MWBWLbCRWfuwZc3BShCkycOhLLgAAAAwZJREFUeNrt2FdOGwEYhdHfkwSSmJbeEzrpld57tSkG4/3vJA9GyA6KbEUzA4TzLeFI9+WGJEmSJEmSJEnKqGdPi4XcKvY8fxEptbPZ/bCQX8Xuvogk53YjpUqrSb49zh/rKFLq8CDJt1uwYMGCBQsWLFiwYMGCBSulFmC133yk1MT45WO9evmkll29vXORUlOT+7UMW9+qtMZ65w89a7811ltK9UptYJ1iqlc9gQULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggUL1jXAGsRUr7rWGmsAU72NzaS54YiZ6b3KeXuFnv7ItrHRkXsNzf7ciatZaWu50lDHm6GIcvm4se3DyLZa193Gur5+i6vZyuJSI8yDzteRe4+S5r4sWfxfu50019HJBBYsWLBgwWICCxYsWLBgMYEFCxYsWLCYwIIFCxYsWExgwYIFCxYsJrBgwYIFCxYTWLBgwYIFiwksWLBgwYLFBBYsWLBgwWICCxYsWLBgMYEFCxYsWLCYwIIFCxYsWExgwYIFCxYsJrBgwYIFCxYTWLBgwYIFiwksWJeNVWbSPlaVSdtY7z9/uvMP9X34OHsTsNJqF1b73YcFCxYsWLBgwYIFCxasq9SjJK1+Re6Vy8eNbR9GttW67qZT11Fk2sriUiPMg87XETPTe5Xz9go9/ZFtY6Mj99Lo+49yZFppa7nSUMeboYjkjwZcbvU2NpPmhi9iDWKqV11Lmrt1EesUU73qCSxYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsGDBggULFixYsK4B1ltM9Ur7rbHeYTqrDaxXL5/Usqu3dy5Sampyv5Zh61uVFlg5NB8pNTGeZNzlYy1ESh0e/P9YR7BgwYIFCxYsWLBgwYIF68Zj7UZKlVaTfHsc8expsZBbxZ7nLyKldja7Hxbyq9jd5w+VJEmSJEmSJCmbfgMTmK0SFovSGAAAAABJRU5ErkJggg==";
const tiktokIcon = "/assets/7_tiktok-BFXVYZxH.ico";
const daisyuiIcon = "/assets/80_daisyui-DPhvUajU.ico";
const hyperuiIcon = "data:image/x-icon;base64,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";
const heroiconsIcon = "/assets/82_heroicons-J9tXNL8A.ico";
const radixuiIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEySURBVHgB7dhtDcIwEAbgFxQg4aQgAQfgAAkgAQk4QEJBwXBQHCBhtBkLkCyj167dXdIn6b/rjzf7uPYAvpa5hqzcOrhlvuoat7YoIDUAuWVH6u27JpvUADZgj69ZIZOUADvGviMySQnQMPYZBFiAr2XWLybaO2gJ5UoHuDJq7yFFpQPcGLUnZJLyEftfow3YY5FRSgCPoLyR9Xb4/a0adP/+bA2sqgrw7+/erQs+H6oK/fn+ifCPWAzC+CFNNML/xiQWIayrinVGWiOb1RrpnXhWBooDEKY5C00i5j6wgXKc10fkExB13C09lZhcnUrMLSbAA4LEBAia15QSE4Az2xGJIKgPxOI0M5HWUB7A8xd31QFC55yiERTfiXuE8RBqHDEcRBVCN3U2UDaZq6qqivMCLBtK4wriLRgAAAAASUVORK5CYII=";
const shadcnIcon = "/assets/84_shadcn-BA7m-CyI.ico";
const alicdnIcon = "/assets/85_alicdn-qW1xwL3q.svg";
const headlessuiIcon = "/assets/86_headlessui-CsYwJSXk.ico";
const copycharIcon = "/assets/89_copychar-BTQILQ3X.png";
const githubIcon = "/assets/8_github-aM8kXaxp.ico";
const iconesIcon = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20283.46%20283.46'%3e%3cdefs%3e%3cstyle%3e%20.cls-1{fill:%23231815;}%20@media%20(prefers-color-scheme:%20dark)%20{%20.cls-1{fill:%23ffffff;}%20}%20%3c/style%3e%3c/defs%3e%3cpath%20class='cls-1'%20d='M144.89,89.86c-33.46,0-54.44,14.56-66.14,26.76a86,86,0,0,0-23.69,58.94c0,22.64,8.81,43.48,24.8,58.67,15.7,14.92,36.9,23.14,59.68,23.14,23.81,0,46-8.49,62.49-23.91,17-15.9,26.37-37.93,26.37-62C228.4,120.37,185.94,89.86,144.89,89.86Zm.49,153.67a61.49,61.49,0,0,1-46.45-20.4c-12.33-13.76-18.85-32.64-18.85-54.62,0-20.7,6.07-37.67,17.57-49.07,10.11-10,24.39-15.62,40.19-15.74,19,0,35.22,6.56,46.76,19,12.6,13.58,19.27,34,19.27,58.95C203.87,224.39,174.49,243.53,145.38,243.53Z'/%3e%3cpolygon%20class='cls-1'%20points='198.75%2074.96%20179.45%2074.96%20142.09%2037.83%20104.51%2074.96%2086.14%2074.96%20138.09%2024.25%20146.81%2024.25%20198.75%2074.96'/%3e%3c/svg%3e";
const fontIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAABCCAYAAAAL1LXDAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADfSURBVGhD7dixDYNAEERR90QXtEAJFENEdjH1kBOQEF8LayE5QAsWGlmwGH7wwpPmZ6t75ZztSQi+O4LvjuC7I1g1jqNVVWVFUVxKWZbW9/1qL8Eqgi+C4A+CVXvBdV1b0zSna9vWhmFY7T08uOu6zXdRCFYR7BAcjGAVwQ7BwQhWEewQHIxgFcEOwcEODz7LvGHesrVxiWAVwUEI/oJg1V7wWf/SKSWbpmlz49LhwRwewQhWEewQHIxgFcEOwcEIVhHsEByMYBXBDsHBCFYR7BAcjGAVwQ7BwX4O/i/Z3hcm12JNz+o+AAAAAElFTkSuQmCC";
const appiconIcon = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAACJTNkAiUrYAIlL2AGJS9gBiUvYAYlL2AGJStgBiUjYAIlJ2ACJStgBiUvYAYlL2AGJS9gBiUvYAYlJ2ACJTNkAiWPeAIlh3WWIX92lhl3cooZd3KKGXdyiiGDdoolh3T6JYd1AiGDdo4Zd3KKGXdyihl3coohf3aWJYd1jgnHeAIpm3wKIZd6loIPl/7yn7P+8p+z/uqTs/5V14v+IZN5oiGTea5Z24v+6pOz/vKfs/7yn7P+fguT/iGXeoolm3gGKbeECiGrgpb6t7v////////////r5/v+mj+j/h2jfaIdo32unkej/+/n+////////////vazt/4hp4KKLbeABjHTjAolx4aW/se/////////////6+f7/p5Xp/4hv4WiIb+FrqJbp//v6/v///////////72w7/+JcOGijHTiAY175AKKeOOlvbPv//z7/v/7+v7/9vX9/6eZ6v+JduNoiXbja6ia6v/29f3/+/r+//z7/v+8se//injjoox65AGOgeYCjYHmpJqQ6f+qoez/qqHs/6ig7P+Uief/jYHmZ42B5mqVief/qKDs/6mh7P+qoez/mo/p/42B5qKOgeUBi3vmAI+G50GNhOZsi4Hma4uB5muLgeZrjoTna4+G5yiPhucpjoTna4uB5muLgeZri4Hma42E5myPhudAkI7oAJOc7ACRk+pAj5HqaY2P6miNj+pojY/qaJCS6miRk+onkZPqKI+S6miNj+pojY/qaI2P6miPkeppkJPqPpCM6QCRlusCkJbrpJyh7f+rrvD/q67w/6mt7/+XnOz/kJXrZ5CV62qXnOz/qq3v/6uu8P+rrvD/nKDt/5CW66GQl+sBkp3tAo+b7aXAxvX/+/z+//v7/v/29/3/qrPx/4+a7GiOmuxrq7Tx//b3/v/7+/7/+/v+/7/F9P+Pm+2ikp3tAZOk7wKQou6lw8z2////////////+vv+/6y58/+Poe5oj6Hua6268//7/P7////////////By/b/kKHuopOk7wGUq/ECkqnwpcPQ9/////////////r7/v+tvvT/kajwaJCo8Guuv/T/+/z+////////////ws/3/5Go8KKUqvABlbLzApSx8qWqwfX/xNX4/8TV+P/C0/j/oLr0/5Sw8miUsPJrobr0/8LT+P/E1fj/xNX4/6nB9f+UsfKilbHyAZW08wCWt/Rnlbb0p5O186WTtfOlk7XzpZW29KWWt/RAlrf0QpW29KWTtfOlk7XzpZO186WVtvSnlrf0ZZWo8QCXxPcAlsb3AZbF9wKWxfcClsX3ApbF9wKWxfcClsb3AJbG9wCWxfcClsX3ApbF9wKWxfcClsX3ApbF9wGWxPcAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAA==";
const iconoirIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAl/SURBVHgBvVn/b1tXFT/nXjsdnaC2ujb1GprniQEVTHWEGKr4IbZASGMacwRT+fJDYqQhTQiS/gVJ/oK4GjAQEmnEjwgl2X4YTEh++2GaNCEl01SKNCG7SpmltCUuG2uw/e7Zuffd9/ycOs/OF+9Urp337nvvnHPP+ZzPOQ9hiLJTfcURQs2BxEkCbBBibVfQYibzUg2OSRCGJB/d/s20p7wyokgpRCAQoPhxZH7jwpnzLy7CMchQDNCel9KrAiur9AEhQRFGDQDy5NTohdIaHFESMAQRolUGlEZ51rvBfioTwH0+McvKO8R/UILm+XRoQHXrj3lICAcUNkDgZjbzo9ogzxrKDvx361c7rCiHjgC2opS+8NJ1ffzO1u/zSogK8XG9E2xG1pOQAi+xqkA4nR3i80KUxf8+WsxmS424ZwkYgmjljYKIBElwg+NnPv+iq5VXZNZAuw0OK19hQx2TJza8dOjxLs21H/3sar9nDccAtPHOn114pPucPa/PYcJ4PqXzw1dcbPJ/teBaRSJ/886f8vCpG2AVIEDsdQ7sLigdZuAbxQeuZkevTDxx7kqWDXTNOpPsiTn4tA1QESX3ijFMh5DOA6skr61lH/9xOVzjqRWy+YBCnop71lBQKFBeK7lXfMX0cez8xk6emDUyORnsYo9N7JKhGGAcH3p4zzkT/7xLQT3Qv0Gtd60hzId55OF63LOOxYCdrVfy/CzHU8lGKyk3SXlhHjxkAFjFyKINR7H8+IEbnL9xezXHp5zA+9hGF4ZlwE715bxIymX2ouPpBwoPEhw7kSSGXgaADSFtCP9zo1iPCZn3d0UvFrWvjj27CcMw4EP2ugKqqFBREcKjCrAckPwg6TYg3AUDlfBm9DwX8OeV3R21JzcObcCH1aU8gJzn++b4xiniUq9QhfhtPb1pC5hjwsNooz3tdRvQhT6oLXKDcxs7qynVArsDCB6plX669YXRj2+9PMvLKny/vFaeeQrfH3OsvOMjiOCbtCdOj/1swhOyQMTFCNEq2ksC9DG70Hgy84IbnBlpyWIHmbAxceY5t59+sQY8qC5xYqoy2TJvwwI78GYCpJYe+7mJ00ymVGN/L/qhYcIDdz3mOhGhCN/ZGz7MfybDMCThwgASa4DHYRMoyt+sHE1xXE6QgDW9xcr3YqpaXQ6VPH++tGaaF/DDRciRYpeSiLYK88NJdtNpxfAZhCVRLHwOZAAnad443KzCxfSFX6wZbzc/U+K/GzYcUidHVFe5ZwWvhUjEFDpqIBvd8HND6Oxwg+Pv1V/Lm/yxO8A758JRDQBzQ410GiIxDOm0hj0U5YBVMpvsUrLdVGUwihq8T8HJk7PhLQlKfK3LdOLqxcxULTQsKYo+LzJh6V7OPFODYzAgAnsw03VhM3GNFWlYBEqdONE5r3GdQJZVUGlV59wXRn+w9sWzU4Uvn5sqdz2LwNIHkxsDhc9ABmj9/CQWk3d0xbWSNkrCGoWII6ajlypPrYf1QQjnZn3V2e8xG/XXdeXNBQnOweXCcRhg2kGL2xpRhJDdSiqxErBL9nZuq85toZXs2E82wSZ6r4ocFSk19tv6gFCbOBtffaMSe+f7t39dpaDV872zI5vJJ9KR0v9BfaXiMfnyGSheY5TiOiCm+bp8WHH9euHy+QZ/bvHf7BiqNRnZRkg0WkIusYM4iaXe9etfO/3tEgwosZU4qJoG2gxkijSNKJ2Qi8EaT6Fu1m2Pi9M8RvmlsrUiLGY+3Ob9WiJsVybZ5wgt3/CQvTJU34IDSHwIEYT9a8hdEOfq9WVHn6/yN9eES2Hh8jsspLC/Bb9BhyAMu0croTHQKZTIteede+7y2/WKAwNIbAj95/Zvq7rhDtCBIjHN3q1pOsHep9DjIZETVUaen5JMNDyuxGxkimnmOHObNMrEuB6tcKgxl5KaN6Woc0/i+6PZEe6Nd5uqUMgUaoc24N6/f1flku741RPfZTS5RJFOSkV+R5SHNqipL41eGXho9c72Gzku2dwHiHkzNwpGK0xTmtieKKQL+45W+pC5znYLiUt6xqMphUWloEY0eOPn+LsWcnyFKTiAPH32O5tPP/at6984XchyDixaZ5CeFQn1yOGb+jCJ+dP0EDNjpeuPZ6b11KDAni5xK1ig3f9nx8/98JomZhQQPJGYv1FfnYnD/v3km6cLCxy2ZU0a/ZwRs3HrY0No+4M/cMMCBg499v4YG7Df2vfrPL8R6Dc4jDCRkNrk7zXB1fUrA+J7ZaeSkurEjmfQiaG16WULmcu1Xmv7kDnrUeNZGbcUDK8nvBo06pFvrrCw0Ea5sXn3L9WNu28s//3u34ob1cq+YaZjXumQREl6F9qJhLPf2vgQskYQ2SlzH3ny3PfLDCNZpsIrOgHBjNQDKDX30kVxhn+uep+jjbe2K7n9n20mdqj6pGl8S4m2iEH/HQjEMswZ/fu9O69pfl8kfsGhlOU6nQ+P4FHH90NVt7KzkSLVTgVrW5RoHMqAKLZzKI7DAeUpvyXUH0PYvERihp0yr2yRQ9F7ZKK8VtEUOU1BmGo8eza3b+70yYHIpEEcbQo5ofm9EKco0uExir3Zay0/r2gGBiTIi7xD6CXxOaDoPtjGXSk48rsEDicMdtTjPLmcfrjKVupvO6zW8/aVFJJHh5/M6akBEAQvI2JfNAwinsQyF7lTHJCNk4LKvda0kiN5sLxJN0zfHb0UuwPxOcA8JxiDsDMuwRHFejyWKnNeTDN9YR4pGIGoLx2JDSH0ub1NZFGEIUulvuFwk5RnxEK/tcSVftfEJzGJ9eAFhGaN7/d5W3JUaSZhIUIOa8+decrtd02sAf6bQumGVFqJ5ej04Tjldfa+7ruV73lNXRYHua4vNnrEN0K/D+BwcnYfTS/BEASTOE9k56rcayS9Y5jMadEcRw+qwpkm4cw/tl+t3uTCBMckf733LisvZjhkfYj1aOWZzMXaINcOjO3/3F7d4FDKqUh3xvDKYxW51iRh+th2uLoDbtFj7chxD5PcpclxDpeiB5y4ZGdC7P3vPXYxCwPKwO8HHiShMNKCBd7eWUsxyK+YVJT8U/P3pG4JSfczEDbpwhYu7V0MBlcBQeSrTLUnv53ki255LSjAAeTA1fXG9qsz/B5m3swxgx6Zaa+2IKAekTGMVVgYAywca4rgGwXSrjX9gytbWBo0dA5tQCBv/evPM9xnTrIBOqxykbDq8CeyCkc+HgUhyEMBkA3+02V0W38h+3UXDiGfADslu3xAUnqJAAAAAElFTkSuQmCC";
const iconfinderIcon = "/assets/94_iconfinder-pkhoYZkX.ico";
const nextifiIcon = "data:image/jpeg;base64,/9j/4QC8RXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAACQAAAADoAQAAQAAACQAAAAAAAAA/9sAQwAGBgYGBwYHCAgHCgsKCwoPDgwMDg8WEBEQERAWIhUZFRUZFSIeJB4cHiQeNiomJio2PjQyND5MRERMX1pffHyn/9sAQwEGBgYGBwYHCAgHCgsKCwoPDgwMDg8WEBEQERAWIhUZFRUZFSIeJB4cHiQeNiomJio2PjQyND5MRERMX1pffHyn/8AAEQgAJAAkAwEiAAIRAQMRAf/EABkAAQEAAwEAAAAAAAAAAAAAAAAGBAUHCP/EACgQAAEEAQIEBgMAAAAAAAAAAAEAAgMEEQUSBhMxQSE1UXFzgYKS0f/EABgBAAMBAQAAAAAAAAAAAAAAAAAEBQYD/8QAIxEAAgICAQQCAwAAAAAAAAAAAQIAAwQRBQYTIWESMUFxgf/aAAwDAQACEQMRAD8A8qLc6dotjUIXyRSxNDX7SHE56Z7ArTK34XftrvHZ0xB/UYS+VY9dJZD53LvTuFi53KV0ZKk1lW3o6O/xJuvpdieaxEHMa6E4duz1zjsFh2IHV55InEEsdgkdF0CWsItUsygeE8LXfk04P9URqvmNr5CuePe1r+vgD/Y5zXC08dhqQG7oyXQkn7UE/E69jU16IicmWhWHD4JpS4684498BR6q9Cs14ajxJNGw84nDnAHGAlcsE0nQ35E0PTDonKqXcKvbfyTqVbpWWqcNhnQtD/o+BH0uc6r5ja+Qqo4f1Ks2nLXsTsZsedm44Ba/sPYqW1QtdqFote1zeYcOByCPUEJfErau+1CDoA6Prcu9T51WdwvHZK2IXsZe4oI2HCkHx+5gIiKlMDCIiIQiIiEIiIhP/9k=";
const linkedinIcon = "/assets/97_linkedin-bdAbr_s7.ico";
const xiaomiIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA5CAYAAABj2ui7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM5OTgwNDA3MDUzNDExRTY4QzEyREMyMTFCQ0ZGOUQyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM5OTgwNDA4MDUzNDExRTY4QzEyREMyMTFCQ0ZGOUQyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Qzk5ODA0MDUwNTM0MTFFNjhDMTJEQzIxMUJDRkY5RDIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Qzk5ODA0MDYwNTM0MTFFNjhDMTJEQzIxMUJDRkY5RDIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6iWnnrAAABe0lEQVR42uzav0uCQRzH8fdTEQrlEgQNUTa2NAQ2tQXRlC39Awb9Ay0tUdRWY43tjUFLk1MQtERDOEQURSohKFJpmdo9BIk8So9SZMfnCwfP/Xie43XcPXfDOdXl4Bywb9IQdkXKpJhjgEkLcV9IF1jF4ujC8hBQQAEFFFBAAQUUUEABBWwvelp+Y3gCxmd+pvdKGTK3kIhDMd9af2cHkH34BeBYBBY2f3aYCwZ3ZL4Z3/Pf3/WpL2BnTNFgCBa3Ibph+RqcXYHRSYuBjgPTsT/+yTSL3Sikr75v1xuA8BTMr0No0FsfjnQo0F3wmRt/bZMJuDuH1RMzh7rr6wL9lkzR+4vP1HH7oK+1ZMZtYKTBdpCD52wtn3/8p8BAH2xdesuPd+BwTUc1AQUUUEABBRRQQAHbO4uW3uAl5y2vVGrP7rWGRm1Kxfr865O3XSHvr7/yu79zv25ZCCiggAIKKKCAAgoooIACNgOmLPalXeCS+2Ahzr2hEPsQYAAlGVqhhRmWQwAAAABJRU5ErkJggg==";
const fbIcon = "/assets/99_fb-UJ3aIC6r.ico";
const instargramIcon = "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IB2cksfwAACGBJREFUWIWdl1uMXlUVx39rn30u3zeX3qbTMlNKEahA+6BAoHIRJbUBtQ/U+ADBRBJF1EgTlIT4pD4Qg2IkRoiBEKMmqEBAQJCALVYElAqJEVSEWjrt9EaZyzffd657Lx/2mbYQXnQn/+wzZ9b+/v+99lprryOcNLaP6yoX+e3i2SIqG8Vraj1ErsH6hsTXxL4h1YbENaTqyVBSVVKFBEjaOVaPxWNxRDS1pX45wj3TJb9rLZdOL3LK4sPNk83nVaO7VTWLPFgF68E6R+wbMt+Q+prM12SuJlVHqo5M9TipVcECkSoWxeCJcBgchpqIGijfgeKGdXzioeMCbp2ovtCIvccoRAqxQuwh8UrqG1LX0PE1HVeR+ZqOr8l8Q6JKokqsikWIFCIEAxg8giI4DA3QIFQIFVAo6NZTuPK38q0P6Nq68q8KMmwWiRVSr2TO09GGrqvpupKOr+i4QJ5qQ6IueAmIVDAtOSiCAgq4lrwBaqBCKRDKYwsMzrK29NsjkeGI8EMxkKqSoQzhmLxEWbs1IR2KSUYU2wWbKiLBfUbbM2wUPJB7mHVwuKF5cAb/wjyKQ6mBup0blHrFKH67HTZyOQqGcO4JgXzVuY7z74hZdp7h/x325jH05T7uM/9A99Z4KpQTs6G5TH466WpErFGwKLH3LJv0XPJYTLZa0EIZPDGAf+aY+Zoor4hKh1EPqqAgSAinxMBQi3M78NmxoOStAt3yEvr6HJ4KT4mnwFH27JiIVRTTRm1Mw0U/T8lWC82+hoOfPEi8PyfzJZkvsb5CfA1uUYBBVRCVk5MK8LAugZ0fgnUd5N5zkY/uRKgwlDhKhHLErMQzhmM5Ncu0Ys2lnuGzDXg4cvVBkkN9OianIwMSGSAyACnAFGDK8EyFUgFlwPbVcN9ZENdw1Z/BK1y2Ai4eRigQCiIKDCV2uZZ48XgJ0bpySweA/NF57P55UlOQURBr0aZQ3UY2MN5BKtCjJXgTgn7jCPzwrDYwK7hhN+w4AptXwZZxeP5NhBKoEGrsqOQ4HB6HSk02loZEenOB1PRINSduVSM1Mmbhy2fD9WfAimAr/xnA/VNw1x6YmoPXF+DMIdh1EMjhxUNBwGlZ+LvdiFBhO/TwNDhpUGrs6FIAokEfMceINUekBKlhXQeeuArGO+8O99O78M0PwrVr4OM7YMNjMJHCvjmgAVcFu8i3AurWmw025Rje1DhqvJSYbBIAU80QxYcxvgStYGIIebAln5pH79wNj+4DY5ErToVbz4d1w/DU5eimR5F9xwI5NZRlENAxbZxUKE04Amum8aZGpAoCzMYg1s2APQRag3rkSxfCqaOwfxbd9jM4UICz4CP0l7Owawr5/TZYP4p85Uz0tr8gGkowdSsgphVQIzR4GoxE+zDRXqJoL9ZOQRzcJdEckhyG5G1I34Erzwmx8aOn4NhhSPqQDCDOIcnh0BH03lcC0efWgy3aDClaT7SVrhUQ3jkM0RQS78ck05jkACLtedkeJMcgnYXVChMhNnjhZUgHkOaQFgFJEcQ81ApYvxyGG9QWqClaQtq7YbEUOxSPJZmGqEaiBiKHmGAscR/tzACmPbt2pDl0cnAJ+AqaGJoIIgPLR4KNAHYBkgoaB9KcKE407RyGIXkH0hlIZ5B0Bkww1jiHrBeQT8PMTFix9YIgIGuRDiALkEvXBJvXDgALwTNxAdG7BSiKtvSGdBaSOcjmIZsL6QZhcXcBhvow1EeffCRs7ppPhWjv9iHrt/MgpOKNVwTxv94VPJUUkJRo1BYup60IBQTFYkl7EDuwDVgHzSAQdT061AeJQBN4+heweQuMTyI/+A786gH0b/+CgUM2XwHbtsDSEZg6Ao/tCAKMhuNYLBu+QY2CF5QIiLGa9pDEBfLYg+sF45EIugMwNpRePYzefgNy6z2wagJu+uq7rh4A9uxFv/FdYAayED5BQLDUsoJY0VrAWyDBataDxAcRsYdqNhiPJDCctwIaIIFiD/q9a2HT1chFn4aJM8KNOLUH3bkDfvMkzBZhx2JaARKay0UPJGH3WlvEZ1jNFpDUQxJ6Ma2Ohtt93QZ0pPWAJEGEb8AfgOd/gu66D7QDdQwDB5UBY6BrIJLwHIV3csH6IODg0dC9YhBNkDrDkpVIppAS8O+H4WM3wTlXwqmTMP8WiGuPwQURLm7Tr4LSgomgisCaEzAmeGHNWrj4vODVx//QCohALWiCMR0NLuu2OPIsHPgTmBi57mmYmISRAkYHMJqfwJJBeLekxcgARnIYyqFbBGw8Hfnx98PuX3wFpg+gKUhikCRG4hTxXzM5XZ+RwXGsOhvZ+jsYPi0s3v8k+vZLIapcE4qLM6EHcFF4riVki0/Bx8jpH4YNF4b1hw7hb7wF3bOAlCNQLEXKFWi5ciD+lugFum4TnZMEpALLTkMuux+Wb3pvrP9v4++70du+je7vo/kwUoxCvhwpx/DVyh1WM31GMjaRtfmaAamC24s+9xFYugHWXINkk2ASkAzEBm+oBDgJPWJVQ1FBDXpwCnY/B6+9gfZTSLqIc+A94tpm1rnHRb8+MuZP6b8hw35JECBBQNxen1Gby+/pN4+X9boNwCKC3MKChX4MvRgWYlhIoZ+hgyEYDEO+BClWQDE+LW7sHCN39N5udOh6YtHwdfk+SN9nTltvdRx0auhUAd0KshZpA2mDJk1oUOMGiRuwTS22uE7euGneAKS39B722tmm1hwNH4Yt0eKn0slzwon/HxeokDnIasia48QkgTSgXsS0M/VmefX2nbzHsfTuXjXePWXuizJabyaSTaRNRnRSSV1csXgE7iSUwADoR8H98zHMJ9BL0fnOrPSH/qr58B+NSe6UR56dXeT8L+GcB2m2i38aAAAAAElFTkSuQmCC";
const Data = [
  { name: "热门", aimPoint: "hot", icon: FireIcon, list: [
    { id: "1", title: "Google", url: "https://www.google.com", imageUrl: googleIcon, description: "全球领先的搜索引擎。" },
    { id: "2", title: "Youtube", url: "https://www.youtube.com", imageUrl: youtubeIcon, description: "全球最大的视频分享平台。" },
    { id: "3", title: "Gmail", url: "https://mail.google.com", imageUrl: mailIcon, description: "Google邮箱。" },
    { id: "4", title: "Wikipedia", url: "https://www.wikipedia.org/", imageUrl: wikipediaIcon, description: "维基百科，自由的百科全书。" },
    { id: "5", title: "X（Twitter）", url: "https://x.com/", imageUrl: twitterIcon, description: "原推特，社交互动和多媒体内容的平台。" },
    { id: "6", title: "Facebook", url: "https://www.facebook.com/", imageUrl: facebookIcon, description: "脸书，全球领先的社交网络平台。" },
    { id: "9", title: "Instagram", url: "https://www.instagram.com/", imageUrl: instargramIcon, description: "全球流行的社交媒体和照片分享平台。" },
    { id: "7", title: "TikTok", url: "https://www.tiktok.com/", imageUrl: tiktokIcon, description: "业界领先的移动短视频平台。" },
    { id: "8", title: "GitHub", url: "https://github.com/", imageUrl: githubIcon, description: "在线软件源代码托管服务平台。" }
  ] },
  { name: "娱乐", aimPoint: "joy", icon: FaceSmileIcon, list: [
    { id: "100", title: "Reddit", url: "https://www.reddit.com/", imageUrl: redditIcon, description: "一个娱乐、社交及新闻网站。" },
    { id: "101", title: "NGA", url: "https://www.nga.cn/", imageUrl: ngaIcon, description: "游戏社区论坛，精英玩家俱乐部。" },
    { id: "102", title: "v2ex", url: "https://www.v2ex.com/", imageUrl: v2exIcon, description: "面向程序员和科技爱好者的创意工作社区。" },
    { id: "103", title: "Tumblr", url: "https://www.tumblr.com/", imageUrl: tumblrIcon, description: "轻博客平台。" },
    { id: "104", title: "OP.GG", url: "https://www.op.gg/", imageUrl: opggIcon, description: "搜索 Riot ID 和标语以获取所有游戏模式的统计数据。" },
    { id: "105", title: "Pixiv", url: "https://www.pixiv.net/", imageUrl: pixivIcon, description: "以插图、漫画和小说艺术为中心的虚拟社区网站。" },
    { id: "106", title: "afreecaTV", url: "https://www.afreecatv.com/", imageUrl: afreecatvIcon, description: "韩国直播网站。" },
    // {id: '301',title: 'byruthub', url: 'https://byruthub.org/', imageUrl: 'https://byruthub.org/favicon.ico', description: 'byruthub'},
    { id: "107", title: "Twitch", url: "https://www.twitch.tv/", imageUrl: twitchIcon, description: "直播平台。" },
    { id: "108", title: "品葱", url: "https://pincong.rocks/", imageUrl: pincongIcon, description: "中文论坛网站，讨论内容以政治及时事等话题为主。" },
    { id: "109", title: "nicovideo", url: "https://www.nicovideo.jp/", imageUrl: nicovideoIcon, description: "日本在线弹幕视频分享网站。" },
    { id: "110", title: "SimilarSites", url: "https://www.similarsites.com", imageUrl: similarsitesIcon, description: "搜索相似的网站。" },
    { id: "111", title: "美剧迷", url: "https://www.meijumi.net/", imageUrl: meijumiIcon, description: "下载美剧。" }
  ] },
  { name: "影视", aimPoint: "video", icon: PlayCircleIcon, list: [
    { id: "200", title: "哔哩哔哩", url: "https://www.bilibili.com/", imageUrl: bilibiliIcon, description: "国内知名的视频弹幕网站。" },
    { id: "201", title: "IMDb", url: "https://www.imdb.com/", imageUrl: imdbIcon, description: "在线电影、电视和电子游戏数据库。" },
    { id: "202", title: "Netflix", url: "https://www.netflix.com/", imageUrl: nextifiIcon, description: "通称网飞或奈飞，全球领先的流媒体服务平台。" },
    { id: "203", title: "DisneyPlus", url: "https://www.disneyplus.com/", imageUrl: disneyplusIcon, description: "华特迪士尼公司推出的在线流媒体视频点播平台。" },
    { id: "204", title: "打驴动漫", url: "https://www.dqsj.top/", imageUrl: dalvIcon, description: "为全体皮友，段友，提供一个免费无广告在线追番看剧平台！" }
  ] },
  { name: "AI工具", aimPoint: "AI", icon: SparklesIcon, list: [
    { id: "300", title: "Claude", url: "https://claude.ai/", imageUrl: claudeIcon, description: "由 Anthropic 开发的人工智能对话平台。" },
    { id: "301", title: "ChatGPT", url: "https://chatgpt.com/", imageUrl: chatgptIcon, description: "由OpenAI开发的人工智能聊天机器人程序。" },
    { id: "302", title: "devv", url: "https://devv.ai/", imageUrl: devvIcon, description: "最懂程序员的新一代 AI 搜索引擎。" },
    { id: "303", title: "Midjourney", url: "https://www.midjourney.com/home", imageUrl: midjIcon, description: "基于 AI 的艺术生成平台，用户可以通过输入文本描述生成独特的数字艺术作品。" },
    { id: "304", title: "Phind", url: "https://www.phind.com/", imageUrl: phindIcon, description: "专注于提供编程和技术领域的精确答案和解决方案。" },
    { id: "305", title: "Forefront", url: "https://chat.forefront.ai/", imageUrl: forefrontIcon, description: "基于 AI 技术的对话平台。" },
    { id: "306", title: "Poe", url: "https://poe.com/", imageUrl: poeIcon, description: "由Quora开发的AI 智能聊天助手。" },
    { id: "307", title: "Kimi", url: "https://kimi.moonshot.cn/", imageUrl: kimiIcon, description: "由Moonshot AI（月之暗面）推出的智能对话助手" },
    { id: "308", title: "Felo", url: "https://felo.ai/", imageUrl: feloIcon, description: "Felo AI 是一款聊天机器人式搜索引擎。" },
    { id: "309", title: "Consensus", url: "https://consensus.app/", imageUrl: consensusIcon, description: "Consensus是一个利用人工智能在科学研究中寻找答案的搜索引擎。" },
    { id: "310", title: "Gemini", url: "https://gemini.google.com/", imageUrl: geminiIcon, description: "Google AI 助手。" },
    { id: "311", title: "ChatHub", url: "https://app.chathub.gg/", imageUrl: chathubIcon, description: "ChatHub是一个AI对话机器人聚合客户端。" },
    { id: "312", title: "aminer", url: "https://www.aminer.cn/", imageUrl: aminerIcon, description: "AI帮你理解科学。" },
    { id: "313", title: "拜拜导航", url: "https://www.88sheji.cn/ai", imageUrl: shejiIcon, description: "一个为白领而生的AI工具箱。" }
  ] },
  { name: "新闻", aimPoint: "news", icon: BookOpenIcon, list: [
    // {id: '200',title: '人民网', url: 'http://www.people.com.cn/', imageUrl: 'http://www.people.com.cn/favicon.ico', description: '人民网'},
    { id: "400", title: "议报", url: "https://yibaochina.com", imageUrl: yibaochinaIcon, description: "发表有关中国境内人权和法治状况的专栏文章和新闻文章。" },
    { id: "401", title: "纽约时报中文网", url: "https://cn.nytimes.com", imageUrl: nytimesIcon, description: "网站介绍《纽约时报》的优秀作品，包括新闻、评论、时尚和文化等内容。" },
    { id: "402", title: "华尔街日报", url: "https://cn.wsj.com", imageUrl: wsjIcon, description: "提供全球财经、商业、政治等领域的深度报道和分析。" },
    { id: "403", title: "法广", url: "https://www.rfi.fr", imageUrl: rfiIcon, description: "法国国际广播电台，提供多语言的全球新闻报道和分析。" },
    { id: "404", title: "日经中文网", url: "https://cn.nikkei.com", imageUrl: nikkeiIcon, description: "日本经济新闻中文版。" },
    { id: "405", title: "DW", url: "https://www.dw.com", imageUrl: dwIcon, description: "德国之声是德国的国际广播电台和新闻网站。" },
    { id: "406", title: "Time", url: "https://time.com", imageUrl: timeIcon, description: "《时代》杂志的官方网站，提供全球新闻报道、深度分析、专题故事。" },
    { id: "407", title: "CNN", url: "https://edition.cnn.com", imageUrl: cnnIcon, description: "CNN 的国际版新闻网站。" },
    { id: "408", title: "BBC", url: "https://www.bbc.com/", imageUrl: bbcIcon, description: "英国广播公司（BBC）的官方网站。" },
    { id: "409", title: "Reuters", url: "https://www.reuters.com/", imageUrl: reutersIcon, description: "路透社的官方网站。" }
    // {id: '207',title: 'chinadigitaltimes', url: 'https://chinadigitaltimes.net/chinese', imageUrl: 'https://chinadigitaltimes.net/favicon.ico', description: 'chinadigitaltimes'},
  ] },
  { name: "技术与文档", aimPoint: "tech", icon: Bars3BottomLeftIcon, list: [
    // {id: '10',title: 'Chrome Developer', url: 'https://developer.chrome.com', imageUrl: 'https://www.google.com/favicon.ico', description: 'Google Chrome 的开发者网站。'},
    // {id: '9',title: 'Google Cloud', url: 'https://cloud.google.com', imageUrl: 'https://cloud.google.com//favicon.ico', description: 'Google 云服务。'},
    { id: "500", title: "Quora", url: "https://www.quora.com/", imageUrl: quoraIcon, description: "一个在线问答网站。" },
    { id: "501", title: "Repositories Ranking", url: "https://gitstar-ranking.com", imageUrl: grIcon, description: "展示 GitHub 用户和仓库排名的网站。" },
    { id: "502", title: "Angular", url: "https://angular.cn/", imageUrl: angularIcon, description: "Web 框架，能够帮助开发者构建快速、可靠的应用。" },
    { id: "503", title: "Vue", url: "https://cn.vuejs.org/", imageUrl: vuejsIcon, description: "渐进式JavaScript框架。" },
    { id: "504", title: "React", url: "https://zh-hans.react.dev/", imageUrl: reactIcon, description: "用于构建 Web 和原生交互界面的库。" },
    { id: "505", title: "Vite", url: "https://cn.vitejs.dev/", imageUrl: vitejsIcon, description: "下一代的前端工具链。" },
    { id: "506", title: "LeetCode", url: "https://leetcode.com", imageUrl: leetcodeIcon, description: "LeetCode 是帮助您提高技能、扩展知识和准备技术面试的最佳平台。" },
    { id: "507", title: "DEV Community", url: "https://dev.to/", imageUrl: devIcon, description: "程序员分享、了解最新动态并发展职业生涯的地方。" },
    { id: "508", title: "Quasar Framework", url: "https://quasar.dev/", imageUrl: quasarIcon, description: "企业级跨平台 VueJs 框架。" },
    { id: "509", title: "MDN Web Docs", url: "https://developer.mozilla.org/", imageUrl: mozillaIcon, description: "记录 Web 技术，包括 CSS、HTML 和 JavaScript。" },
    { id: "510", title: "stackoverflow", url: "https://stackoverflow.com/", imageUrl: stackshareIcon, description: "每个开发者都有一个打开 Stack Overflow 的选项卡。" },
    { id: "511", title: "BetterExplained", url: "https://betterexplained.com/", imageUrl: betterexplainedIcon, description: "学习理解数学，而不是死记硬背。" },
    // {id: '406',title: 'wangdoc', url: 'https://wangdoc.com/', imageUrl: 'https://wangdoc.com/favicon.ico', description: 'wangdoc'},
    { id: "512", title: "Hacker News", url: "https://news.ycombinator.com/", imageUrl: ycombinatorIcon, description: "科技新闻和讨论社区。" },
    { id: "513", title: "CodeProject", url: "https://www.codeproject.com/", imageUrl: codeprojectIcon, description: "免费公开源码的程序设计网站。" },
    { id: "514", title: "Javascript Tutorial", url: "https://javascript.info/", imageUrl: javascriptIcon, description: "现代 JavaScript 教程。" },
    // {id: '410',title: 'github', url: 'https://github.com/', imageUrl: 'https://github.com/favicon.ico', description: 'github'},
    { id: "515", title: "RabbitMQ", url: "https://www.rabbitmq.com/", imageUrl: rabbitmqIcon, description: "RabbitMQ 是一种可靠且成熟的消息传递和流媒体代理。" },
    { id: "516", title: "Docker Docs", url: "https://docs.docker.com/", imageUrl: dockerIcon, description: "Docker 文档。" },
    { id: "517", title: "Confluent Docs", url: "https://docs.confluent.io/", imageUrl: confluentIcon, description: "查找使用基于 Kafka 的流数据平台所需的指南、示例和参考内容。" },
    { id: "518", title: "gRPC", url: "https://grpc.io/", imageUrl: grpcIcon, description: "高性能、开源通用RPC框架。" },
    { id: "519", title: "web.dev", url: "https://web.dev/", imageUrl: webdevIcon, description: "帮助开发者学习现代 Web 技术。" },
    { id: "520", title: "ZBar", url: "https://zbar.sourceforge.net/", imageUrl: zbarIcon, description: "读取各种来源的条形码。" },
    { id: "521", title: "BookStack", url: "https://www.bookstack.cn/", imageUrl: bookstackIcon, description: "书栈网，各类技术书籍。" },
    { id: "522", title: "Medium", url: "https://medium.com/", imageUrl: medumIcon, description: "开放的在线出版平台，用户可以在此撰写、发布和分享各种主题的文章。" },
    { id: "523", title: "StackShare", url: "https://stackshare.io/", imageUrl: stackshareIcon, description: "最大的技术堆栈开发者社区。" },
    { id: "524", title: "Sci-Hub", url: "https://www.sci-hub.ru/", imageUrl: scihubIcon, description: "世界上第一个提供大众和公众访问研究论文的网站。" },
    // {id: '423',title: 'sci-hub', url: 'https://sci-hub.shop/', imageUrl: 'https://sci-hub.shop/favicon.ico', description: 'sci-hub'},
    { id: "525", title: "Patterns", url: "https://www.patterns.dev/", imageUrl: patternsIcon, description: "是一个关于设计、渲染和性能模式的免费在线资源。" },
    { id: "526", title: "animista", url: "https://animista.net/", imageUrl: animistaIcon, description: "css 动画库。" },
    { id: "527", title: "JavaScript", url: "https://js.okten.cn/", imageUrl: oktenIcon, description: "《JavaScript 权威指南第七版》中英对照。" },
    { id: "528", title: "Ledger", url: "https://www.ledger.com/zh-hans/academy", imageUrl: ledgerIcon, description: "Web3从这里开始。" }
  ] },
  {
    name: "UI库",
    aimPoint: "UI",
    icon: WindowIcon,
    list: [
      { id: "600", title: "Tailwind CSS", url: "https://tailwindcss.com/", imageUrl: tailwindcssIcon, description: "一个实用程序优先的CSS框架。" },
      { id: "601", title: "daisyUI", url: "https://daisyui.com/", imageUrl: daisyuiIcon, description: "Tailwindcss 组件库。" },
      { id: "602", title: "HyperUI", url: "https://www.hyperui.dev/", imageUrl: hyperuiIcon, description: "免费开源 Tailwind CSS 组件。" },
      { id: "603", title: "Heroicons", url: "https://heroicons.com/", imageUrl: heroiconsIcon, description: "由 Tailwind CSS 制作者手工制作的精美 SVG 图标。" },
      { id: "604", title: "Radix", url: "https://www.radix-ui.com/", imageUrl: radixuiIcon, description: "针对快速开发、轻松维护和可访问性而优化的开源组件库。" },
      { id: "605", title: "shadcn", url: "https://ui.shadcn.com/", imageUrl: shadcnIcon, description: "设计精美的组件，您可以将其复制并粘贴到您的应用程序中。" },
      { id: "606", title: "iconfont", url: "https://www.iconfont.cn/", imageUrl: alicdnIcon, description: "阿里巴巴矢量图标库。" },
      { id: "607", title: "HeadlessUI", url: "https://headlessui.com/", imageUrl: headlessuiIcon, description: "完全无样式、完全可访问的 UI 组件，旨在与 Tailwind CSS 完美集成。" },
      { id: "608", title: "Boxicons", url: "https://boxicons.com/", imageUrl: boxiconsIcon, description: "为设计师和开发人员精心制作的简单开源图标。" },
      { id: "609", title: "Flaticon", url: "https://www.flaticon.com/", imageUrl: flaticonIcon, description: "为您的项目下载免费图标和贴纸。" },
      { id: "610", title: "CopyChar", url: "https://copychar.cc/", imageUrl: copycharIcon, description: "将特殊字符复制到剪贴板。" },
      { id: "611", title: "Icones", url: "https://icones.js.org/", imageUrl: iconesIcon, description: "开源的图标搜索和管理平台。" },
      { id: "612", title: "Font Awesome Icons", url: "https://fontawesomeicons.com/", imageUrl: fontIcon, description: "专门展示和提供 Font Awesome 图标库的各类图标。" },
      { id: "613", title: "App Icon Generator", url: "https://www.appicon.co/", imageUrl: appiconIcon, description: "应用程序图标生成器。" },
      { id: "614", title: "Iconoir", url: "https://iconoir.com/", imageUrl: iconoirIcon, description: "向您的新免费图标库问好。" },
      { id: "615", title: "IconFinder", url: "https://www.iconfinder.com/", imageUrl: iconfinderIcon, description: "为您的设计项目提供数百万张图形。" }
    ]
  },
  { name: "博客", aimPoint: "blog", icon: ViewColumnsIcon, list: [
    { id: "700", title: "Google Blog", url: "https://blog.google", imageUrl: googleIcon, description: "Google 的官方博客网站。" },
    { id: "701", title: "Netflix Tech Blog", url: "https://netflixtechblog.com/", imageUrl: nextifiIcon, description: "Netflix 的技术博客。" },
    { id: "702", title: "LinkedIn Blog", url: "https://www.linkedin.com/blog/engineering", imageUrl: linkedinIcon, description: "LinkedIn 的工程博客。" },
    { id: "703", title: "小米信息部技术团队", url: "https://xiaomi-info.github.io/", imageUrl: xiaomiIcon, description: "小米信息部技术团队发布的文章。" },
    { id: "704", title: "Meta Blog", url: "https://engineering.fb.com/", imageUrl: fbIcon, description: " Meta（Facebook）的工程博客。" },
    { id: "705", title: "Shopify Blog", url: "https://shopify.engineering/", imageUrl: shopifyIcon, description: "shopify 工程博客。" },
    { id: "706", title: "美团技术团队", url: "https://tech.meituan.com/", imageUrl: meituanIcon, description: "美团技术团队发布的文章。" },
    { id: "707", title: ".Net Blog", url: "https://devblogs.microsoft.com/dotnet/", imageUrl: devblogsIcon, description: ".Net 博客。" },
    { id: "708", title: "Dropbox Tech Blog", url: "https://dropbox.tech/", imageUrl: dropboxIcon, description: "Dropbox 的技术博客。" },
    { id: "709", title: "Coding Horror Blog", url: "https://blog.codinghorror.com/", imageUrl: codinghorrorIcon, description: "Jeff Atwood 的个人博客，他是 Stack Overflow 的联合创始人之一。" },
    { id: "710", title: "Wait But Why", url: "https://waitbutwhy.com/", imageUrl: wbwIcon, description: "由 Tim Urban 运营的博客，提供深入、幽默的长篇文章，涵盖各种话题。" },
    { id: "711", title: "Program-Think Blog", url: "https://program-think.blogspot.com/", imageUrl: programthinkIcon, description: "编程随想的博客。" }
  ] },
  { name: "工具", aimPoint: "tool", icon: WrenchIcon, list: [
    { id: "800", title: "Chrome应用商店", url: "https://chromewebstore.google.com/", imageUrl: chromestoreIcon, description: "Chrome的扩展程序。" },
    { id: "801", title: "Google Fonts", url: "https://fonts.google.com", imageUrl: googlefontsIcon, description: "Google 字体。" },
    { id: "802", title: "Google Trends", url: "https://trends.google.com", imageUrl: trendsIcon, description: "探索全球用户正在搜索的内容。" },
    { id: "803", title: "Chrome Support", url: "https://support.google.com", imageUrl: googleIcon, description: "有什么能帮助你的。" },
    { id: "804", title: "Dropbox", url: "https://www.dropbox.com/", imageUrl: dropboxIcon, description: "云存储服务平台，提供文件存储、同步和共享功能。" },
    { id: "805", title: "Excalidraw", url: "https://excalidraw.com/", imageUrl: excalidrawIcon, description: "在线白板变得简单。" },
    { id: "806", title: "DoodleBoard", url: "https://www.doodleboard.pro/", imageUrl: doodleboardIcon, description: "一款内置涂鸦样式的一体化白板，可帮助您轻松组织和展示您的想法。" },
    { id: "807", title: "BlockExplorer", url: "https://blockexplorer.one/", imageUrl: blockexplorerIcon, description: "区块链浏览器网站。" },
    { id: "808", title: "帮小忙", url: "https://tool.browser.qq.com/", imageUrl: browserIcon, description: "腾讯QQ浏览器在线工具箱。" },
    { id: "809", title: "Web前端导航", url: "https://www.alloyteam.com/nav/", imageUrl: alloyteamIcon, description: "腾讯Web前端导航。" },
    { id: "810", title: "Internet Archive", url: "https://archive.org/", imageUrl: archiveIcon, description: "互联网档案馆是一个非盈利图书馆。" },
    { id: "811", title: "Figma", url: "https://www.figma.com/", imageUrl: figmaIcon, description: "矢量图形编辑器和原型设计工具。" },
    { id: "812", title: "Pinterest", url: "https://www.pinterest.com", imageUrl: pinimgIcon, description: "视觉发现和社交分享平台。" },
    { id: "813", title: "Miku Tools", url: "https://tools.miku.ac/", imageUrl: mikuIcon, description: "工具集合，数量还在持续增加中。" },
    { id: "814", title: "itellyou", url: "https://msdn.itellyou.cn/", imageUrl: tellyouIcon, description: "提供 Microsoft 软件的镜像下载链接。" },
    { id: "815", title: "SciHub", url: "https://www.scihub.net.cn/", imageUrl: scihubIcon, description: "SciHub学术导航。" },
    { id: "816", title: "Dribbble", url: "https://dribbble.com/", imageUrl: dribbbleIcon, description: "从世界各地数百万顶级设计师和机构的作品中获取灵感。" },
    { id: "817", title: "Pexels", url: "https://www.pexels.com/", imageUrl: pexelsIcon, description: "免费素材图片。" },
    { id: "818", title: "Bitcoin Core", url: "https://bitcoincore.org/", imageUrl: bitcoincoreIcon, description: "提供比特币核心客户端的下载、开发文档、更新日志等资源。" },
    { id: "819", title: "Tor", url: "https://www.torproject.org/", imageUrl: torprojectIcon, description: "洋葱浏览器。" },
    { id: "820", title: "我查", url: "https://chl.cn/huilv/", imageUrl: chlIcon, description: "汇率查询。" },
    { id: "821", title: "优设", url: "https://hao.uisdc.com/", imageUrl: uisdcIcon, description: "百万设计师都在用的优设导航。" },
    { id: "822", title: "蒲公英", url: "https://www.pgyer.com/", imageUrl: pgyerIcon, description: "应用分发平台，主要为开发者提供移动应用的内测分发、托管和管理服务。" },
    { id: "823", title: "Ipinfo", url: "https://ipinfo.io/", imageUrl: ipinfoIcon, description: "IP 地址数据的可信来源。" },
    { id: "824", title: "docsmall", url: "https://docsmall.com/", imageUrl: docsmallIcon, description: "免费的在线图片与 PDF 处理工具。" },
    { id: "825", title: "DesignCrowd", url: "https://www.designcrowd.com/", imageUrl: designcrowdIcon, description: "每次都获得完美的定制设计。" },
    { id: "826", title: "Web Archive", url: "https://web.archive.org/", imageUrl: archiveIcon, description: "查看过去的网站快照，访问已归档的网页内容，保存和研究互联网的历史记录。" },
    { id: "827", title: "Good Design Tools", url: "https://www.gooddesign.tools/", imageUrl: prodIcon, description: "为设计师提供的最佳工具和资源的集合。" },
    { id: "828", title: "Developer Way", url: "https://www.developerway.com/", imageUrl: developerwayIcon, description: "前端开发人员的高级模式。" }
  ] },
  { name: "其他", aimPoint: "other", icon: TicketIcon, list: [
    { id: "900", title: "Google I/O", url: "https://io.google", imageUrl: ioIcon, description: "Google举行的网络开发者大会。" },
    { id: "901", title: "freeCodeCamp", url: "https://www.freecodecamp.org/", imageUrl: freecodecampIcon, description: "免费编程学习平台。" },
    { id: "902", title: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/", imageUrl: geeksforgeeksIcon, description: "面向程序员和计算机科学爱好者的技术网站。" },
    { id: "903", title: "coursera", url: "https://www.coursera.org/", imageUrl: courseraIcon, description: "Coursera与多家大学合作，给大众带来一些在线免费课堂。" },
    { id: "904", title: "udemy", url: "https://www.udemy.com/", imageUrl: udemycdnIcon, description: "提供各种主题的课程，课程由各领域的专家和教育者提供。" },
    { id: "905", title: "wallhaven", url: "https://wallhaven.cc/", imageUrl: wallhavenIcon, description: "提供高质量壁纸下载的网站。" },
    // {id: '701',title: 'wallha', url: 'https://wallha.com/', imageUrl: 'https://wallha.com/favicon.ico', description: 'wallha'},
    { id: "906", title: "UNPKG", url: "https://unpkg.com/", imageUrl: unpkgIcon, description: "unpkg 是一个快速的全球内容交付网络，适用于 npm 上的所有内容。" },
    { id: "907", title: "SMS-Activate", url: "https://sms-activate.io", imageUrl: smsactivateIcon, description: "SMS-Activate在线接受短信的虚拟号码服务。" },
    { id: "908", title: "Dupay", url: "https://www.dupay.one/", imageUrl: dupayIcon, description: "在Dupay拥有您的第一张数字货币。" },
    { id: "909", title: "morioh", url: "https://morioh.com/", imageUrl: moriohIcon, description: "面向程序员和开发人员的社交网络。" },
    // {id: '701',title: '无名图书', url: 'https://www.book345.com/', imageUrl: 'https://www.book345.com/favicon.ico', description: '线上图书浏览。'},
    { id: "910", title: "熊猫速汇", url: "https://www.pandaremit.com/", imageUrl: pandaremitIcon, description: "跨境汇款新方式，国际换汇安全又便捷。" },
    { id: "911", title: "China Law Translate", url: "https://www.chinalawtranslate.com/", imageUrl: chinalawtranslateIcon, description: "法律翻译网站，专注于将中国的法律、法规、政策文件翻译成英文。" },
    { id: "912", title: "Tutorials Teacher", url: "https://www.tutorialsteacher.com/", imageUrl: tutorialsteacherIcon, description: "帮助您轻松、快速地为各个级别的学习者学习技术。" }
  ] }
];
const TestData = {
  data: Data
};
function InfoDialog({ isOpen, close }) {
  return /* @__PURE__ */ jsxs(Dialog, { open: isOpen, onClose: close, className: "relative z-30", children: [
    /* @__PURE__ */ jsx(
      DialogBackdrop,
      {
        transition: true,
        className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /* @__PURE__ */ jsxs(
      DialogPanel,
      {
        transition: true,
        className: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95",
        children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-700", children: /* @__PURE__ */ jsx("div", { className: "sm:flex sm:items-start", children: /* @__PURE__ */ jsxs("div", { className: "mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left", children: [
            /* @__PURE__ */ jsx(DialogTitle, { as: "h3", className: "text-base font-semibold leading-6 text-gray-900 dark:text-gray-200", children: "免责声明" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 tracking-wide dark:text-gray-400", children: /* @__PURE__ */ jsx("p", { className: "mb-2", children: "本网站仅提供网站导航服务，方便用户快速访问其他网站。本网站上的所有链接均由用户自行选择访问，与本网站作者无关。 我们不对外部网站的内容、准确性、合法性或安全性负责，也不对任何因使用本网站而引发的直接或间接损失承担责任。用户在使用本网站时，应自行判断和承担相关风险。" }) }) })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-600", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "data-autofocus": true,
              onClick: close,
              className: "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto\r\n                 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600",
              children: "关闭"
            }
          ) })
        ]
      }
    ) }) })
  ] });
}
function Footer() {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const emailAddress = "zhen951111@gmail.com";
  return /* @__PURE__ */ jsxs("footer", { className: "", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-screen-xl sm:px-6 lg:px-8 flex", children: /* @__PURE__ */ jsx("div", { className: " py-4 m-auto", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-xs/relaxed text-gray-500 dark:text-gray-400", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          onClick: () => setOpen(true),
          className: "text-gray-700 dark:text-gray-200 underline transition hover:text-gray-700/75 dark:hover:text-gray-200/75 cursor-pointer",
          children: "免责声明"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "mx-2", children: "·" }),
      /* @__PURE__ */ jsxs(
        "span",
        {
          className: "text-gray-700 dark:text-gray-200 transition hover:text-gray-700/75 dark:hover:text-gray-200/75",
          children: [
            "联系作者：",
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `mailto:${emailAddress}`,
                className: "text-gray-600 dark:text-gray-200 hover:underline text-xs hover:text-blue-600 dark:hover:text-blue-300",
                children: emailAddress
              }
            )
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx(InfoDialog, { isOpen: open, close: handleClose })
  ] });
}
const sessionSecret = process.env.SESSION_SECRET ?? "DEFAULT_SECRET";
const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true
  }
});
async function getThemeSession(request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  console.log(session);
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    setTheme: (theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session)
  };
}
const links = () => [
  { rel: "stylesheet", href: stylesheet }
];
const loader$1 = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const data = {
    theme: themeSession.getTheme()
  };
  return data;
};
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [webList, setWebList] = useState([]);
  const [theme] = useTheme();
  useLoaderData();
  useEffect(() => {
    let list = [];
    TestData.data.forEach((item) => {
      list = list.concat(item.list);
    });
    setWebList(list);
  }, []);
  function toggleMenu() {
    setIsSidebarOpen(!isSidebarOpen);
  }
  function closeSidebar() {
    setIsSidebarOpen(false);
  }
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, className: clsx(theme), children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("meta", { name: "name", content: "星点|StartDust" }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "星点 导航网页 星星点点 汇聚星海" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "bg-[#eff3f4] h-screen flex dark:bg-gray-800", children: [
      /* @__PURE__ */ jsx(
        "aside",
        {
          id: "sidebar",
          className: `fixed top-0 left-0 h-full w-72 bg-[#faf9f8] shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden z-20 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:block`,
          children: /* @__PURE__ */ jsx(SideMenu, { data: TestData, closeSidebar })
        }
      ),
      /* @__PURE__ */ jsxs("main", { className: "flex w-full overflow-auto flex-col", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex fixed top-0 w-full h-20 left-0 backdrop-blur-md border z-10\n            border-white/20 dark:bg-gray-700/50 dark:border-gray-800/50",
            children: [
              /* @__PURE__ */ jsx("div", { className: "block lg:hidden m-auto", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => toggleMenu(),
                  className: "rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75\n               dark:bg-gray-800 dark:text-gray-300\n               ",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "h-5 w-5",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          d: "M4 6h16M4 12h16M4 18h16"
                        }
                      )
                    }
                  )
                }
              ) }),
              /* @__PURE__ */ jsx(Search, { list: webList })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 container mx-auto h-full px-4", children: [
          isSidebarOpen && /* @__PURE__ */ jsx(
            "div",
            {
              className: "fixed inset-0 bg-black bg-opacity-50 lg:hidden",
              onClick: closeSidebar
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "pb-8 mt-24 ", children: /* @__PURE__ */ jsx(AnchorCard, { ...{ testData: TestData } }) }),
          /* @__PURE__ */ jsx(Footer, {})
        ] })
      ] }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function AppWithProviders() {
  var data = useLoaderData();
  return /* @__PURE__ */ jsx(ThemeProvider, { specifiedTheme: data.theme, children: /* @__PURE__ */ jsx(App, {}) });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AppWithProviders,
  links,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");
  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme} is not a valid theme`
    });
  }
  themeSession.setTheme(theme);
  return json(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } }
  );
};
const loader = async () => redirect("/", { status: 404 });
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader
}, Symbol.toStringTag, { value: "Module" }));
function Index() {
  return /* @__PURE__ */ jsx(Fragment, {});
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DycPomRv.js", "imports": ["/assets/jsx-runtime-DLUFujEo.js", "/assets/components-CwjpGDut.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BKFhJCe0.js", "imports": ["/assets/jsx-runtime-DLUFujEo.js", "/assets/components-CwjpGDut.js"], "css": ["/assets/root-DjR377qW.css"] }, "routes/action.set-theme": { "id": "routes/action.set-theme", "parentId": "root", "path": "action/set-theme", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/action.set-theme-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-5wruCL-t.js", "imports": ["/assets/jsx-runtime-DLUFujEo.js"], "css": [] } }, "url": "/assets/manifest-463feaf0.js", "version": "463feaf0" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_lazyRouteDiscovery": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/action.set-theme": {
    id: "routes/action.set-theme",
    parentId: "root",
    path: "action/set-theme",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
