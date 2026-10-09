import { useEffect } from "react";
import { Icon } from "../Icon/Icon";
import s from './Toast.module.css'

interface ToastProps{
  message: string | null;
  onClose: ()=> void;
}

export function Toast({message, onClose}:ToastProps){

  useEffect(()=>{
  if(message === null) return;

  const id = setTimeout(onClose, 2000)

  return()=> clearTimeout(id)
}, [message, onClose])

  if(message === null) return null;

  return(
    <div className={s.toast} role="status" aria-live="polite">
      <Icon name="check" size={16}/>
      <span>{message}</span>
    </div>
  )
}

