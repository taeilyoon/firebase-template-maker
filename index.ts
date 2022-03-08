import fs from "fs";
import data from "./test.json";
import { faker } from "@faker-js/faker";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue, GeoPoint } from "firebase-admin/firestore";
import { type } from "os";
import { firestore } from "@google-cloud/firestore/types/protos/firestore_v1_proto_api";
import { build } from "protobufjs";
import { count } from "console";
import YAML from 'yaml';

type firebaseType = "string" | "number" | "map" ;
interface DummyDocumentData {
  name: string;
  type: firebaseType;
  ref?: string;
  dummy: string;
}
interface DummyCollection {
  name: string;
    data: DummyDocumentData[];
    count?: number;
}

async function main() {
  const app = await initializeApp(data["firebase-config"]);
  console.log('app', app);
  const parsed = data.models.map(
    (e): DummyCollection => ({
      name: e.name,
      data: e.data.map(
        (e2): DummyDocumentData => ({
          name: e2.name,
          ref: e2.ref,
          dummy: e2.dummy,
          type: e2.type as firebaseType,
        })
      ),
    })
  );
    faker.locale = 'ko'
    
    const uuid = {
        
    } 

    parsed.forEach((e) => { 
        uuid[e.name] = Array.from(Array(10).keys()).map((index) =>(faker.datatype.uuid()));

      })


    const db = getFirestore();

    parsed.forEach((e, index) => { 
      Array.from(Array(10).keys()).forEach((index)=>{
        const data = {};
        
        e.data.forEach((d) => { 
            data[`${d.name}`] = d.ref ? uuid[d.ref][index]:buildDummy(d)
        })
        
        writeFirestoreTest(e.name, uuid[e.name][index], data)
  
      })
   })
}

function writeFirestoreTest(colllection, id, data) {
  const doc = new YAML.Document();
  doc.contents = {
      [`${colllection}/${id}`] : data
    };
  fs.appendFileSync('test.txt', doc.toString());
}

function writeFirestore({db, colllection, id}): void {
  
}

async function initializeFirebase() {
  return await initializeApp(data["firebase-config"]);
}
function buildDummy(d: DummyDocumentData) {
  return d.dummy === "name"
    ? faker.name.firstName() + faker.name.lastName()
    : d.dummy === "location"
    ? new GeoPoint(+faker.address.latitude(), +faker.address.longitude())
          : d.dummy === "date" ? Timestamp.fromMillis(faker.date.past().getMilliseconds())
              : d.dummy === "image" ? faker.image.cats() 
              : d.dummy === "nick" ? faker.internet.userName()    
                      : d.dummy === "email" ? faker.internet.email()
                      : d.dummy === "product" ? faker.commerce.productName()
                      : d.dummy === "email" ? faker.internet.email() 
                      : d.dummy === "word" ? faker.word.verb()
                      : d.dummy === "rorem" ? faker.lorem.words()
                      : ""
}



main();
