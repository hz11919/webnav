import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface dialogProps {
  isOpen: boolean,
  close: () => void;
}

export default function InfoDialog({ isOpen, close }: dialogProps) {

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-30">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-700">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-200">
                    免责声明
                  </DialogTitle>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 tracking-wide dark:text-gray-400">
                      <p className='mb-2'>本网站仅提供网站导航服务，方便用户快速访问其他网站。本网站上的所有链接均由用户自行选择访问，与本网站作者无关。
                      我们不对外部网站的内容、准确性、合法性或安全性负责，也不对任何因使用本网站而引发的直接或间接损失承担责任。用户在使用本网站时，应自行判断和承担相关风险。
                      </p>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-600">
              <button
                type="button"
                data-autofocus
                onClick={close}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto
                 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600"
              >
                关闭
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
