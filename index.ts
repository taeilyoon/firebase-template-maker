import fs from "fs";
import data from "./test.json";
import { faker } from "@faker-js/faker";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue, GeoPoint } from "firebase-admin/firestore";
import { type } from "os";
import { firestore } from "@google-cloud/firestore/types/protos/firestore_v1_proto_api";
import { build } from "protobufjs";
import { count } from "console";

type firebaseType = "string" | "number" | "map";
interface DummyDocumentData {
  name: string;
  type: firebaseType;
  ref: string;
  dummy: string;
}
interface DummyCollection {
  name: string;
    data: DummyDocumentData[];
    count?: number;
}

async function main() {
  const app = await initializeApp(data["firebase-config"]);
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
    
    const created = {
        
    } 

    parsed.forEach((e) => { 
        created[e.name] = Array(10).map((index) =>  
            faker.datatype.uuid()
        );
    })
    const db = getFirestore();


    parsed.map((e) => { 
        const data = {};
        
        e.data.map((d) => { 
            data[`${d.name}`] = buildDUmmy(d)
        })
        // db.collection(e.name).doc
    })
}

function writeFirestore() {}

async function initializeFirebase() {
  return await initializeApp(data["firebase-config"]);
}

main();
function buildDUmmy(d: DummyDocumentData) {
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
    
            
}

