import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc,getDoc,updateDoc, getDocs,doc , query , where,limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWiQnBa9YhiP4txLwtKWHL_Czb_pQK5e4",
  authDomain: "daliahpagedb.firebaseapp.com",
  projectId: "daliahpagedb",
  storageBucket: "daliahpagedb.firebasestorage.app",
  messagingSenderId: "69493768608",
  appId: "1:69493768608:web:6a254f184e26490b8924c5",
  measurementId: "G-NFEF3MVSQQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function addFireData(newData) {
    try {
        let itemSended = await addDoc(collection(db, "general-data"),
            newData
        )
        return (itemSended.id)
    } catch (error) {
        throw new Error(`Error registrando el producto: ${error.message}`)
    }
}

export async function getFireData() {
    try {
        const dataToDeliver = []
        const dataQuery = await getDocs(collection(db, "general-data"))
        dataQuery.forEach((e)=>dataToDeliver.push({...e.data(),id:e.id}))
        return dataToDeliver;
    } catch (error) {
        throw new Error(`Error solicitando el/los productos: ${error.message}`)
    }
}

export async function updateGeneralData(element,newData) {
    try {
        await updateDoc(doc(db, "general-data",element),newData)
        console.log(newData," Enviada correctamente a ",element)
    } catch (error) {
        throw new Error(`Error registrando la data: ${error.message}`)
    }
}

export async function getGeneralData(element,reqData) {
    try {
        const dbResponse = await getDoc(doc(db,"general-data",element))
        const generalObject = dbResponse.data()
        return generalObject[reqData]
    } catch (error) {
        throw new Error(`Error solicitando la data: ${error.message}`)
    }
}

export async function getUser(email) {
    try {
        const docRef = query(collection(db,"users"),where('email',"==",email),limit(1))
        const dbResponse = await getDocs(docRef)
        const generalObject = dbResponse.docs[0]
        return {id:generalObject.id, ...generalObject.data()}
    } catch (error) {
        throw new Error(`Error solicitando la data: ${error.message}`)
    }
}

