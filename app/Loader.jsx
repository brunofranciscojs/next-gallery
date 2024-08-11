export default function Loader(){
   const loadSpin = `<svg width="80px" height="80px" viewBox="0 0 16 16" fill="none" class="hds-flight-icon--animation-loading"><g fill="#000000" fill-rule="evenodd" clip-rule="evenodd"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"/><path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"/></g></svg>`
   return(
      <div dangerouslySetInnerHTML={{__html:loadSpin}} className="absolute left-1/2 top-1/2 block [&>svg]:animate-spin -translate-x-1/2 -translate-y-1/2 animate-[vanish_.3s_forwards] [animation-delay:2.5s] transition-[opacity_.3s]"></div>

   )
}