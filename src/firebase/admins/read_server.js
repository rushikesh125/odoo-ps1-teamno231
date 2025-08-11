import { doc, getDoc } from "firebase/firestore"
import { db } from "../config";

export const getAdmins = async({id})=>{
    const docs = await getDoc(doc(db,"admins",id));
    if(docs.exists()){
        return docs.data();
    }else{
        return null
    }
    // console.log("DOC:",docs.data());
    
}