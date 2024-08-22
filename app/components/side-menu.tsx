import { Link } from "@remix-run/react";
import { ITestData } from "~/libs/data";
import ThemeModeToggle from "./theme-mode-toggle";
import { CardProps } from "~/libs/card-props";
import { favitoreListAtom } from "~/utils/favitore_list_atom";
import { useAtom } from "jotai";
import { FireIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Suspense, useRef } from "react";
import logo from "../../public/logo.png";

interface ChildProps {
  data: ITestData;
  closeSidebar: () => void;
}

export default function SideMenu({ data, closeSidebar }: ChildProps) {
  function scrollToSection(aimPoint: string) {
    closeSidebar();

    const element = document.getElementById(aimPoint);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  const [favitoreList] = useAtom(favitoreListAtom);

  return (
    <div
      className="flex h-screen flex-col justify-between border-e bg-[#f7f7f7]
     dark:border-e-black dark:bg-gray-700 border-none"
    >
      <div className="px-4 py-6">
        <div
          className="flex h-14 rounded-lg text-2xl justify-start
          text-gray-600 dark:text-gray-300"
        >
          <img src={logo} alt="logo" className="w-10 h-8 my-auto mx-2" loading="lazy"/>
          <div className="flex flex-col ml-2 my-auto">
            <span className="font-bold text-xl">星点</span>
            <span className="text-xs">星光点点，汇聚星海</span>
          </div>
        </div>

        <ul className="mt-6 space-y-1 overflow-y-auto">
          {Boolean(favitoreList) && Boolean(favitoreList.length) && (
            <li key={999}>
              <div
                onClick={() => scrollToSection("favitore")}
                className="flex rounded-lg px-2 py-2 text-sm font-bold cursor-pointer
              hover:text-blue-500 dark:hover:text-blue-400
               text-gray-500 hover:bg-gray-100 tracking-wider
                dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <HeartIcon className="size-6" />

                <span className="my-auto ml-2">我的收藏</span>
              </div>
            </li>
          )}

          {data.data.map((r, index) => {
            return (
              <li key={index} className="">
                <div
                  onClick={() => scrollToSection(r.aimPoint)}
                  className="rounded-lg px-2 py-2 text-sm font-bold flex w-full cursor-pointer
                  hover:text-blue-500 dark:hover:text-blue-400
                   text-gray-500 hover:bg-gray-100 font-body tracking-wider
                    dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  {r.icon && <r.icon className="size-5"></r.icon>}

                  <span className="my-auto ml-2">{r.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-300/70 dark:border-gray-800">
        <div className="p-4">
          <div className="flex flex-row justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              主题切换
            </span>
            <ThemeModeToggle></ThemeModeToggle>
          </div>
        </div>
      </div>
    </div>
  );
}
