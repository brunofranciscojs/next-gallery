"use client"
import { useContext } from "react";
import { AuthContext } from "./Auth";

export default function useAuth(){
    return useContext(AuthContext)
}