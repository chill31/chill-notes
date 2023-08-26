// MAIN IMPORTS
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import ReactMarkdown from 'react-markdown';

import { v4 as uuidv4 } from 'uuid';

// UI IMPORTS
import { BsPlus, BsXLg, BsTrash, BsPencilSquare, BsShare, BsClipboard } from 'react-icons/bs'
import { CgMaximizeAlt } from 'react-icons/cg'

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
  const [maxNoteModalVisible, setMaxNoteModalVisible] = useState(false);

  const [maxModalMarkdownContent, setmaxModalMarkdownContent] = useState('');

  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const [sharePopupLink, setSharePopupLink] = useState('');

  const [shareTitleContent, setShareTitleContent] = useState('Generating...');
  const [shareBriefContent, setShareBriefContent] = useState('');

  const addNote = () => {

    const title = document.getElementById("modal-note-title-input").value;
    const description = document.getElementById("modal-note-description-input").value;

    const formatted = `${formatDate()}`;

    let fnData = [...data];
    fnData.push({ title, description, created: formatted, });

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

  const maximizeNote = (index) => {
    const noteTitle = data[index].title;
    const noteContent = data[index].description;

    const modalTitle = document.getElementById("max-modal-note-title");

    modalTitle.textContent = noteTitle;
    setmaxModalMarkdownContent(noteContent);

    setMaxNoteModalVisible(true);
  }

  async function shareNote(index) {

    setSharePopupVisible(true);
    setSharePopupLink('');
    setShareBriefContent('');
    setShareTitleContent('Generating...')

    fetch("/api/share", {
      method: 'POST',
      body: JSON.stringify({
        content: data[index].description,
        title: data[index].title,
        created: data[index].created.toString(),
        uuid: uuidv4()
      })
    }).then(d => d.json()).then(data => {
      setShareTitleContent('Generated Link');
      setShareBriefContent('render the content.');
      setSharePopupLink(data.uuid);
    });

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
                <CgMaximizeAlt className={styles.noteIcon} onClick={() => maximizeNote(k)} />
                <BsShare className={styles.noteIcon} onClick={() => shareNote(k)} />

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

      <div className={`${styles.maxModal} ${maxNoteModalVisible ? '' : styles.hidden}`}>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => setMaxNoteModalVisible(false)} />

          <h2 className={styles.noteName} id="max-modal-note-title"></h2>
          <ReactMarkdown className={styles.noteContent} id="max-modal-note-content">{maxModalMarkdownContent}</ReactMarkdown>
        </div>

      </div>

      <div className={`${styles.sharePopup} ${sharePopupVisible ? '' : styles.hidden}`}>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => setSharePopupVisible(false)} />

          <h2 className={styles.modalTitle}>{shareTitleContent}</h2>
          <p className={styles.modalBrief}>

            {
              shareBriefContent === '' ?
                <span className={styles.modalRenderedParagraph}>creating a link for you...</span> :
                <span className={styles.modalRenderedParagraph}>
                  Your note is ready to share with anyone. Provide the given link to anyone for them to recieve this note
                  <br /><br />
                  <span className={styles.shareModalGivenLink}>
                    <BsClipboard className={styles.shareModalGivenLinkCopy} onClick={() => { navigator.clipboard.writeText(`https://chill-notes.vercel.app/share/${sharePopupLink}`) }} />
                    {`https://chill-notes.vercel.app/share/${sharePopupLink}`}
                  </span>
                </span>
            }

          </p>
        </div>

      </div>

    </div>
  )
}
