import { SidebarMenuProps } from "~/libs/sidebar-props";
import NavCard from "./nav-card";
import { ITestData } from "~/libs/data";
import { CardProps } from "~/libs/card-props";
import { useAtom } from "jotai";
import { favitoreListAtom } from "~/utils/favitore_list_atom";
import { Suspense } from "react";

interface IAnchorProps {
  testData: ITestData;
}

export default function AnchorCard({ testData }: IAnchorProps) {
  const [favitoreList] = useAtom(favitoreListAtom);

  const { data } = testData;

  return (
    <>
      {Boolean(favitoreList) && Boolean(favitoreList.length) && (
        <div id="favitore" className="scroll-mt-24" key={999}>
          <h1 className="text-xl font-bold mt-8 mb-4 dark:text-gray-300 border-l-4 border-l-blue-200 pl-2">
            我的收藏
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {favitoreList.map((card, i) => (
              <NavCard
                key={i}
                {...{ props: card }}
              />
            ))}
          </div>
        </div>
      )}

      {data.map((r, index) => {
        return (
          <div id={r.aimPoint} className="scroll-mt-24" key={index}>
            <h1 className="text-xl font-bold mt-8 mb-4 dark:text-gray-300 border-l-4 border-l-blue-200 pl-2">
              {r.name}
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {r.list.map((card, i) => (
                <Suspense fallback={<div>Loading...</div>} key={card.id}>
                  <NavCard
                  key={i}
                  {...{ props: card }}
                />
                </Suspense>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
