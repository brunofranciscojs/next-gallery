import Mansonry from "./Mansory";

export default function App() {

  return (
    <div className="app px-10">
      <div className='presentation duration-200 transition-all relative overflow-hidden z-0 my-[70px] max-w-[1100px] mx-auto sm:py-7 sm:px-16 text-left rounded-3xl flex bg-[length:100%,50%] px-8 py-8'>

        <div className="z-10 relative">
          <span className="text-gray-700 dark:text-gray-200">BRUNO FRANCISCO</span>
          <h1 className="font-bold text-gray-700 dark:text-gray-100 leading-none m-0 w-full text-[clamp(1rem,_0.284rem_+_3.9506vw,_3rem)]">Estudos de ilustras e rabiscos.</h1>
        </div>

        <div className="z-0 bg-[length:80%] w-full h-full absolute right-0 top-0 bg-[center_50%] text-[#e5e5e5] dark:text-[#434343] bg-fixed"></div>
      </div>
      <Mansonry/>
      <footer className="text-center text-gray-700 dark:text-gray-400 pt-20">
        Desenvolvido com Next.JS, Firebase, TailwindCSS - Deployed no Vercel
      </footer>
    </div>
  );
}
