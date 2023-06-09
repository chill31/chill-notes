// MAIN IMPORTS
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import ReactMarkdown from 'react-markdown';

// UI IMPORTS
import { BsPlus, BsXLg, BsTrash, BsPencilSquare } from 'react-icons/bs'

// HOOKS IMPORTS
import { useEffect, useState } from 'react'
import Link from 'next/link';

export default function Home() {

  function formatDate() {

    const date = new Date();

    const formattedDate = Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);

    return formattedDate;

  }

  const notesStorageName = 'chill-notes-app-data';

  const [data, setData] = useState([]);
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);

  const addNote = () => {

    const title = document.getElementById("modal-note-title-input").value;
    const description = document.getElementById("modal-note-description-input").value;

    const formatted = `${formatDate()}`;

    const prevDataLen = data.length;

    let fnData = [...data];
    fnData.push({ title, description, created: formatted, strictCreated: new Date(), mainIndex: prevDataLen });

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setNewNoteModalVisible(false);

  }

  const deleteNote = (index) => {

    let fnData = [...data];

    fnData.splice(index, 1);

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

  }

  const openEditNoteModal = (index) => {
    document.getElementById("edit-note-modal").setAttribute("data-index", index);
    setEditNoteModalVisible(true);

    document.getElementById("note-name").textContent = `(${data[index].title})`;

    document.getElementById("edit-modal-note-title-input").value = data[index].title;
    document.getElementById("edit-modal-note-description-input").value = data[index].description;
  }

  const editNote = () => {

    const title = document.getElementById("edit-modal-note-title-input").value;
    const description = document.getElementById("edit-modal-note-description-input").value;

    const index = Number(document.getElementById("edit-note-modal").getAttribute("data-index"));

    let fnData = [...data];
    fnData[index].title = title;
    fnData[index].description = description;

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setEditNoteModalVisible(false);

  }

  useEffect(() => {

    if (!localStorage.getItem(notesStorageName)) {
      localStorage.setItem(notesStorageName, "[]");
    }

    setData(JSON.parse(localStorage.getItem(notesStorageName)));

    const modals = document.querySelectorAll("[data-modal]");
    addEventListener("keydown", (e) => {

      if (e.key === 'Escape') {
        setEditNoteModalVisible(false);
        setNewNoteModalVisible(false);
      }

    });

    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-modal") === 'true') {
          setNewNoteModalVisible(false);
          setEditNoteModalVisible(false);
        }
      })
    })

  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chill Notes</title>
        <meta name="description" content="store your notes in the web without the risk of losing them here" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>Notes</h1>
        <p className={styles.disclaimer}><span>There&apos;s a specifically designed notes app for code snippets, go to <Link className={styles.disclaimerLink} href="https://code-saver.vercel.app">code-saver.vercel.app</Link>, also made by me</span></p>

        <button className={styles.createNewNoteBtn} onClick={() => setNewNoteModalVisible(true)}>
          <BsPlus className={styles.btnIcon} />
          New Note
        </button>

        <div className={styles.notesContainer}>

          {data.map((note, k) => (

            <div key={k} className={styles.note}>
              <h2 className={styles.noteTitle}>{note.title}<span className={styles.noteCreatedAt}>{note.created}</span></h2>

              <div className={styles.noteMethods}>
                <BsPencilSquare className={styles.noteIcon} onClick={() => openEditNoteModal(k)} />
                <BsTrash className={styles.noteIcon} onClick={() => deleteNote(k)} />
              </div>
              <span className={styles.divider}></span>

              <ReactMarkdown className={styles.actualNote}>{note.description}</ReactMarkdown>
            </div>

          ))}

        </div>

      </main>

      <div className={`${styles.mainModal} ${newNoteModalVisible ? '' : styles.hidden}`} data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setNewNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>New Note</h2>
          <input className={styles.modalInput} id="modal-note-title-input" placeholder="enter note title..." />
          <textarea className={styles.modalInputArea} id="modal-note-description-input" placeholder="enter note description " />

          <button className={styles.modalBtn} onClick={addNote}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editNoteModalVisible ? '' : styles.hidden}`} id="edit-note-modal" data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Note<br /><span className={styles.noteName} id="note-name"></span></h2>
          <input className={styles.modalInput} id="edit-modal-note-title-input" placeholder="enter note title..." />
          <textarea className={styles.modalInputArea} id="edit-modal-note-description-input" placeholder="enter note description " />

          <button className={styles.modalBtn} onClick={editNote}>Confirm</button>

        </div>

      </div>
    </div>
  )
}
