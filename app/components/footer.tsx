import { useState } from "react";
import InfoDialog from "./info-dialog";

export default function Footer() {

    const [open, setOpen] = useState<boolean>(false);

    const handleClose = () => {
        setOpen(false);
    };

    const emailAddress = 'zhen951111@gmail.com';

  return (
    <footer className="">
      <div className="mx-auto max-w-screen-xl sm:px-6 lg:px-8 flex">
        <div className=" py-4 m-auto">
          <p className="text-center text-xs/relaxed text-gray-500 dark:text-gray-400">
            
            <span
            onClick={() => setOpen(true)}
              className="text-gray-700 dark:text-gray-200 underline transition hover:text-gray-700/75 dark:hover:text-gray-200/75 cursor-pointer"
            >
              免责声明
            </span>
            
            <span className="mx-2">·</span>
            <span
              className="text-gray-700 dark:text-gray-200 transition hover:text-gray-700/75 dark:hover:text-gray-200/75"
            >
            联系作者：

            <a 
                    href={`mailto:${emailAddress}`}
                    className="text-gray-600 dark:text-gray-200 hover:underline text-xs hover:text-blue-600 dark:hover:text-blue-300"
                >
                    {emailAddress}
                </a>
            </span>
            
          </p>
        </div>
      </div>

      <InfoDialog isOpen={open} close={handleClose}></InfoDialog>
    </footer>
  );
}
