// MAIN IMPORTS
import Head from 'next/head'
import styles from '../styles/Home.module.css'

// UI IMPORTS
import { BsTrash, BsInfoLg } from 'react-icons/bs'
import { FaUndo } from 'react-icons/fa'

// HOOKS IMPORTS
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {

  const notesStorageName = 'chill-notes-app-data';
  const notesArchiveName = 'chill-notes-archive-data';

  const [data, setData] = useState([]);
  const [archive, setArchive] = useState([]);

  const restoreNote = (index) => {

    let archived = [...archive];
    const splicedData = archive[index];
    archived.splice(index, 1);

    setArchive(archived);
    localStorage.setItem(notesArchiveName, JSON.stringify(archived));

    let normalData = [...data];
    normalData.splice(splicedData.mainIndex, 0, splicedData);

    setData(normalData);
    localStorage.setItem(notesStorageName, JSON.stringify(normalData));

  }

  const deleteFromArchive = (index) => {
    let archiveData = [...archive];
    archiveData.splice(index, 1);

    setArchive(archiveData);
    localStorage.setItem(notesArchiveName, JSON.stringify(archiveData));
  }

  useEffect(() => {

    if (!localStorage.getItem(notesStorageName)) {
      localStorage.setItem(notesStorageName, "[]");
    }

    if (!localStorage.getItem(notesArchiveName)) {
      localStorage.setItem(notesArchiveName, "[]");
    }

    setData(JSON.parse(localStorage.getItem(notesStorageName)));
    setArchive(JSON.parse(localStorage.getItem(notesArchiveName)));

  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chill Notes: Archive</title>
        <meta name="description" content="store your notes in the web without the risk of losing them here" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>Archive</h1>
        <p className={styles.disclaimer}><span>You can check your recently deleted notes here. <Link className={styles.disclaimerLink} href="/">Go Back Home</Link></span>{/*<span className={styles.archiveDisclaimer}><BsInfoLg /> <span>Archived notes will automatically delete after 31 days</span></span>*/}</p>

        <div className={styles.notesContainer}>

          {archive.map((note, k) => (

            <div key={k} className={styles.note}>
              <h2 className={styles.noteTitle}>{note.title}<span className={styles.noteCreatedAt}>{note.created}</span></h2>

              <div className={styles.noteMethods}>
                <BsTrash className={styles.noteIcon} onClick={() => deleteFromArchive(k)} />
                <FaUndo className={styles.noteIcon} onClick={() => restoreNote(k)} />
              </div>
              <span className={styles.divider}></span>

              <p className={styles.actualNote}>{note.description}</p>
            </div>

          ))}

        </div>

      </main>
    </div>
  )
}
