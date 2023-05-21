import { Layout } from "@/components/Layout/Layout";
import { useContract } from "@/util/useContract";
import { Flex } from "gestalt";
import Head from "next/head";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { FirebaseContext } from "./_app";
import { DatasetCard } from "@/components/DatasetCard/DatasetCard";
import { collection, getDocs, getFirestore } from "firebase/firestore";

export default function Home() {
  const { contract } = useContract();
  const { firebaseApp } = useContext(FirebaseContext);
  const db = getFirestore(firebaseApp);

  const [dataSets, setDataSets] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const fetchAllDataSets = async () => {
      const allOnChainDatasetsPromise = contract.methods
        .getAllDataSets()
        .call();
      const allFirebaseDatasetsPromise = getDocs(collection(db, "datasets"));

      const [allOnChainDatasets, allFirebaseDatasets] = await Promise.all([
        allOnChainDatasetsPromise,
        allFirebaseDatasetsPromise,
      ]);

      const finalFBDatasets: Record<string, unknown> = {};
      allFirebaseDatasets.forEach((doc) => {
        finalFBDatasets[doc.id] = {
          fid: doc.id,
          ...doc.data(),
        };
      });

      // merge the two arrays
      const finalDataset = allOnChainDatasets.map((dataset, idx) => {
        const fid = dataset[2];
        const firebaseDoc = finalFBDatasets?.[fid] || {};
        return {
          index: idx,
          owner: dataset[0],
          name: dataset[1],
          fid,
          description: dataset[3],
          cost: dataset[4],
          authorizedUsers: dataset[5],
          ...firebaseDoc,
        };
      });

      setDataSets(finalDataset);
    };

    fetchAllDataSets();
  }, [contract]);

  return (
    <>
      <Head>
        <title>Nexum</title>
        <meta
          name="description"
          content="Get exclusive private AI training datasets"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Flex gap={{ row: 8, column: 8 }}>
          {dataSets?.map(
            (
              {
                index,
                owner,
                name,
                numImages,
                description,
                cost,
                thumbnailUrls,
              },
              idx
            ) => (
              <DatasetCard
                key={idx}
                name={name}
                numImages={numImages}
                description={description}
                cost={cost}
                thumnbnailUrls={thumbnailUrls}
                owner={owner}
                index={index}
              />
            )
          )}
        </Flex>
      </Layout>
    </>
  );
}

export const getStaticProps = () => ({
  props: {
    isAuthenticated: false,
  },
});
