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
declare global {
  interface Array<T> {
    rand(): T;
  }
}

if (!Array.prototype.rand) {
  Array.prototype.rand = function <T>(this: T[]): T {
    return this[0];
  }
}

type firebaseType = "string" | "number" | "map" | "boolean" | "array" | "null" | "timestamp" | "geopoint";
interface DummyDocumentData {
  name: string;
  type: firebaseType;
  ref?: string;
  dummy?: string;
  enum?: string;
}
interface DummyCollection {
  name: string;
  data: DummyDocumentData[];
  count?: number;
  enum?: string;
  enumId?: string;
}
interface IOption {
  dummyCount?: number | { [key: string]: number }
  dummyId?: { [key: string]: number },
  enum: { [key: string]: number },
}

async function main() {
  const app = await initializeApp(data["firebaseConfig"]);
  console.log('app', app);
  const option = data.option;
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

  const uuid: {
    [key: string]: string[];
  } = {};

  parsed.forEach((e) => {
    if (option.dummyId[e.name]) {
      uuid[e.name] = option.dummyId[e.name]
    } else {
      uuid[e.name] = Array.from(Array(option.dummyCount[e.name] ?? 10).keys()).map((index) => (faker.datatype.uuid()));
    }
  })


  const db = getFirestore();
  function writeFirebase(e, index) {
    Array.from(uuid[e.name].keys()).forEach((index) => {
      const data = {};

      e.data.forEach((d) => {
        data[`${d.name}`] = d.ref ? uuid[d.ref].rand() :
         (d.enum ? option.enum[d.enum].rand() : buildDummy(d))
      })

      writeFirestoreTest(e.name, uuid[e.name][index], data)
    })
  }
  parsed.forEach((e, index) => {
    writeFirebase(e, index)
  })
}

function writeFirestoreTest(colllection, id, data) {
  const doc = new YAML.Document();
  doc.contents = {
    [`${colllection}/${id}`]: data
  };
  fs.appendFileSync('test.txt', doc.toString());
}

function writeFirestore({ db, colllection, id }): void {

}

async function initializeFirebase() {
  return await initializeApp(data["firebase-config"]);
}
function buildDummy(d: DummyDocumentData) {

  if (d.type == 'array') {

  }

  if (d.type == 'map') {

  }

  if (d.type == 'null') {
    return null;
  }
  return d.dummy === "name"
    ? faker.name.firstName() + faker.name.lastName()
    : d.dummy === "location"
      ? new GeoPoint(+faker.address.latitude(), +faker.address.longitude())
      : d.dummy === "date" ? Timestamp.fromMillis(faker.date.between('2020-01-01', '2025-01-01').getMilliseconds())
        : d.dummy === "date-past" ? Timestamp.fromMillis(faker.date.past().getMilliseconds())
          : d.dummy === "date-future" ? Timestamp.fromMillis(faker.date.future().getMilliseconds())
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
