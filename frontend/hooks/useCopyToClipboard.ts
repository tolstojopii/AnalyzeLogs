

import { useCallback, } from "react";


export function useCopyToClipboard(
  onResult:(message: string)=>void,
): (text: string)=> Promise<void>{
  const copy = useCallback(
  async(text:string)=>{
      try{
        await navigator.clipboard.writeText(text);
        onResult("Copied!")
      } catch{
        onResult("Failed to copy")
      }
    },[onResult]
  );

  return copy
}


