import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import clsx from "clsx";
import './app.css';
import { Theme, ThemeHead, ThemeProvider, useTheme } from "~/utils/theme-provider";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import SideMenu from "./components/side-menu";
import Search from "./components/search";
import AnchorCard from "./components/anchor-card";
import { TestData } from "./libs/data";
import { useEffect, useState } from "react";
import { CardProps } from "./libs/card-props";
import Footer from "./components/footer";
import { getThemeSession } from "./utils/theme.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export type LoaderData = {
  theme: Theme | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const themeSession = await getThemeSession(request);

  const data: LoaderData = {
    theme: themeSession.getTheme(),
  };

  return data;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [webList, setWebList] = useState<CardProps[]>([]);
  const [theme] = useTheme();
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    let list: CardProps[] = [];

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

  return (
    <html lang="en" suppressHydrationWarning={true} className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="name" content="星点|StartDust"></meta>
        <meta name="description" content="星点 导航网页 星星点点 汇聚星海"></meta>
        <Meta />
        <Links />
      </head>
      <body className="bg-[#eff3f4] h-screen flex dark:bg-gray-800">
        <aside
          id="sidebar"
          className={`fixed top-0 left-0 h-full w-72 bg-[#faf9f8] shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden z-20 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:block`}
        >
          <SideMenu data={TestData} closeSidebar={closeSidebar}></SideMenu>
        </aside>

        <main className="flex w-full overflow-auto flex-col">
          <div
            className="flex fixed top-0 w-full h-20 left-0 backdrop-blur-md border z-10
            border-white/20 dark:bg-gray-700/50 dark:border-gray-800/50"
          >
            <div className="block lg:hidden m-auto">
              <button
                onClick={() => toggleMenu()}
                className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75
               dark:bg-gray-800 dark:text-gray-300
               "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <Search list={webList}></Search>
          </div>

          <div className="flex-1 container mx-auto h-full px-4">
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
                onClick={closeSidebar}
              ></div>
            )}

            <div className="pb-8 mt-24 ">
              <AnchorCard {...{ testData: TestData }}></AnchorCard>
            </div>

            <Footer></Footer>
          </div>
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  var data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}
