// MAIN IMPORTS
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import ReactMarkdown from 'react-markdown';

import { v4 as uuidv4 } from 'uuid';

// UI IMPORTS
import { BsPlus, BsXLg, BsTrash, BsPencilSquare, BsShare, BsClipboard, BsArrowLeft } from 'react-icons/bs'
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

  const notesStorageName = 'chill-notes-data';

  const [data, setData] = useState({ notes: [], categories: [] });
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [maxNoteModalVisible, setMaxNoteModalVisible] = useState(false);

  const [maxModalMarkdownContent, setmaxModalMarkdownContent] = useState('');

  const [categoryNoteMaxModalMarkdownContent, setCategoryNoteMaxModalMarkdownContent] = useState('');
  const [maxCategoryNoteModalVisible, setMaxCategoryNoteModalVisible] = useState(false);

  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const [sharePopupLink, setSharePopupLink] = useState('');

  const [shareTitleContent, setShareTitleContent] = useState('Generating...');
  const [shareBriefContent, setShareBriefContent] = useState('');

  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] = useState(false);
  const [modalCategoryName, setModalCategoryName] = useState('');

  const [newCategoryNoteModalVisible, setNewCategoryNoteModalVisible] = useState(false);
  const [editCategoryNoteModalVisible, setEditCategoryNoteModalVisible] = useState(false);

  // NOTE METHODS

  const addNote = () => {

    const title = document.getElementById("modal-note-title-input").value;
    const description = document.getElementById("modal-note-description-input").value;

    const formatted = `${formatDate()}`;

    let fnData = { ...data };
    fnData.notes.push({ title, description, created: formatted, });

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setNewNoteModalVisible(false);

  }

  const deleteNote = (index) => {

    let fnData = { ...data };

    fnData.notes.splice(index, 1);

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

  }

  const openEditNoteModal = (index) => {
    document.getElementById("edit-note-modal").setAttribute("data-index", index);
    setEditNoteModalVisible(true);

    document.getElementById("note-name").textContent = `(${data.notes[index].title})`;
  }

  const editNote = () => {

    const title = document.getElementById("edit-modal-note-title-input").value;
    const description = document.getElementById("edit-modal-note-description-input").value;

    const index = Number(document.getElementById("edit-note-modal").getAttribute("data-index"));

    let fnData = [...data];
    fnData.notes[index].title = title;
    fnData.notes[index].description = description;

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setEditNoteModalVisible(false);

  }

  const maximizeNote = (index) => {
    const noteTitle = data.notes[index].title;
    const noteContent = data.notes[index].description;

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
        content: data.notes[index].description,
        title: data.notes[index].title,
        created: data.notes[index].created.toString(),
        uuid: uuidv4()
      })
    }).then(d => d.json()).then(data => {
      setShareTitleContent('Generated Link');
      setShareBriefContent('render the content.');
      setSharePopupLink(data.uuid);
    });

  }

  async function shareCategoryNote(categoryIndex, noteIndex) {

    setSharePopupVisible(true);
    setSharePopupLink('');
    setShareBriefContent('');
    setShareTitleContent('Generating...')

    fetch("/api/share", {
      method: 'POST',
      body: JSON.stringify({
        content: data.categories[categoryIndex].notes[noteIndex].description,
        title: data.categories[categoryIndex].notes[noteIndex].title,
        created: data.categories[categoryIndex].notes[noteIndex].created.toString(),
        uuid: uuidv4()
      })
    }).then(d => d.json()).then(data => {
      setShareTitleContent('Generated Link');
      setShareBriefContent('render the content.');
      setSharePopupLink(data.uuid);
    });

  }

  // CATEGORY METHODS

  const addCategory = () => {

    const name = document.getElementById("modal-category-name-input").value;
    let fnData = { ...data };

    fnData.categories.push({ name: name, notes: [] });
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setNewCategoryModalVisible(false);

  }

  const deleteCategory = (k) => {

    let fnData = { ...data };
    fnData.categories.splice(k, 1);

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

  }

  const openEditCategoryModal = (index) => {

    document.getElementById("edit-category-modal").setAttribute("data-index", index);
    setEditCategoryModalVisible(true);

    setModalCategoryName(data.categories[index].name);

  }

  const editCategory = () => {

    const index = Number(document.getElementById("edit-category-modal").getAttribute('data-index'));
    let fnData = { ...data };

    fnData.categories[index].name = document.getElementById("edit-modal-category-name-input").value;
    setData(fnData);

    localStorage.setItem(notesStorageName, JSON.stringify(fnData));
    setEditCategoryModalVisible(false);

  }

  const openCategoryContent = (e, index) => {
    if (e.target.classList.contains('categoryIcon') || e.target.parentElement.classList.contains('categoryIcon')) {
      return;
    } else {

      const categoryContentDiv = document.getElementById(`categoryContent${index}`);
      categoryContentDiv.removeAttribute('data-hidden');

    }
  }

  const hideCategoryContent = (index) => {
    const categoryContentDiv = document.getElementById(`categoryContent${index}`);
    categoryContentDiv.setAttribute("data-hidden", "");
  }

  // NOTES IN CATEGORY METHODS

  const openNewCategoryNoteModal = (index) => {
    const modal = document.getElementById("new-category-note-modal");
    modal.setAttribute('data-category-index', `${index}`);

    setNewCategoryNoteModalVisible(true);
  }

  const addNoteToCategory = () => {

    const modal = document.getElementById("new-category-note-modal");
    const categoryIndex = Number(modal.getAttribute('data-category-index'));

    const title = document.getElementById("modal-category-note-title-input").value;
    const description = document.getElementById("modal-category-note-description-input").value;

    const formatted = `${formatDate()}`;

    let fnData = { ...data };
    fnData.categories[categoryIndex].notes.push({ title, description, created: formatted, });

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setNewCategoryNoteModalVisible(false);
  }

  const deleteCateogryNote = (categoryIndex, noteIndex) => {
    let fnData = { ...data };
    fnData.categories[categoryIndex].notes.splice(noteIndex, 1);

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));
  }

  const openEditCategoryNoteModal = (categoryIndex, noteIndex) => {
    const modal = document.getElementById('edit-category-note-modal');
    modal.setAttribute("data-category-index", categoryIndex);
    modal.setAttribute("data-note-index", noteIndex);

    setEditCategoryNoteModalVisible(true);
  }

  const editCategoryNote = () => {
    const modal = document.getElementById('edit-category-note-modal');

    const cIndex = Number(modal.getAttribute('data-category-index'));
    const nIndex = Number(modal.getAttribute('data-note-index'));

    const modalTitleInput = document.getElementById('edit-modal-category-note-title-input');
    const modalDescriptionInput = document.getElementById('edit-modal-category-note-description-input');

    let fnData = { ...data };
    fnData.categories[cIndex].notes[nIndex].title = modalTitleInput.value;
    fnData.categories[cIndex].notes[nIndex].description = modalDescriptionInput.value;

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setEditCategoryNoteModalVisible(false);
  }

  const maximizeCategoryNote = (categoryIndex, noteIndex) => {
    const noteTitle = data.categories[categoryIndex].notes[noteIndex].title;
    const noteContent = data.categories[categoryIndex].notes[noteIndex].description;

    const modalTitle = document.getElementById("max-modal-category-note-title");

    modalTitle.textContent = noteTitle;
    setCategoryNoteMaxModalMarkdownContent(noteContent);

    setMaxCategoryNoteModalVisible(true);
  }

  useEffect(() => {

    if (!localStorage.getItem(notesStorageName)) {
      localStorage.setItem(notesStorageName, JSON.stringify({ notes: [], categories: [] }));
    }

    setData(JSON.parse(localStorage.getItem(notesStorageName)));

    const modals = document.querySelectorAll("[data-modal]");
    addEventListener("keydown", (e) => {

      if (e.key === 'Escape') {
        setEditNoteModalVisible(false);
        setNewNoteModalVisible(false);
        setEditCategoryModalVisible(false);
        setMaxNoteModalVisible(false);
        setNewCategoryModalVisible(false);
        setSharePopupVisible(false);
      }

    });

    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-modal") === 'true') {
          setEditNoteModalVisible(false);
          setNewNoteModalVisible(false);
          setEditCategoryModalVisible(false);
          setMaxNoteModalVisible(false);
          setNewCategoryModalVisible(false);
          setSharePopupVisible(false);
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

      <main className={styles.main} id="main">

        <h1 className={styles.title}>Notes</h1>
        <p className={styles.disclaimer}><span>There&apos;s a specifically designed notes app for code snippets, go to <Link className={styles.disclaimerLink} href="https://code-saver.vercel.app">code-saver.vercel.app</Link>, also made by me</span></p>


        <div className={styles.btnContainer}>
          <button className={styles.createNewNoteBtn} onClick={() => setNewNoteModalVisible(true)}>
            <BsPlus className={styles.btnIcon} />
            New Note
          </button>

          <button className={styles.createNewNoteBtn} onClick={() => setNewCategoryModalVisible(true)}>
            <BsPlus className={styles.btnIcon} />
            New Category
          </button>

        </div>

        <div className={styles.notesContainer}>

          {data.categories.map((category, k) => (
            <div key={k} className={styles.category} onClick={(e) => openCategoryContent(e, k)}>
              <h2 className={styles.noteTitle}>{category.name}</h2>

              <div className={styles.noteMethods}>
                <BsPencilSquare className={`${styles.noteIcon} categoryIcon`} onClick={() => openEditCategoryModal(k)} />
                <BsTrash className={`${styles.noteIcon} categoryIcon`} onClick={() => deleteCategory(k)} />
              </div>

              <span className={styles.divider}></span>

              <p className={styles.categoryDisclaimer}>Click to view or edit contents</p>
            </div>
          ))}

          {data.notes.map((note, k) => (

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

      <div className={`${styles.sharePopup} ${sharePopupVisible ? '' : styles.hidden}`} style={{ zIndex: 999 }}>

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

      <div className={`${styles.mainModal} ${newCategoryModalVisible ? '' : styles.hidden}`} data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setNewCategoryModalVisible(false)} />

          <h2 className={styles.modalTitle}>New Category</h2>
          <input className={styles.modalInput} id="modal-category-name-input" placeholder="enter category name..." />
          <button className={styles.modalBtn} onClick={addCategory}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editCategoryModalVisible ? '' : styles.hidden}`} data-modal='true' id='edit-category-modal'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditCategoryModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Category<br /><span className={styles.modalCategoryName}>({modalCategoryName})</span></h2>
          <input className={styles.modalInput} id="edit-modal-category-name-input" placeholder="enter new category name..." />
          <button className={styles.modalBtn} onClick={editCategory}>Confirm</button>

        </div>

      </div>

      {data.categories.map((category, k) => (
        <div key={k} className={`${styles.categoryContent} ${k}`} id={`categoryContent${k}`} data-hidden>
          <BsArrowLeft className={styles.categorybackHome} onClick={() => hideCategoryContent(k)} />
          <h1 className={styles.contentTitle}>{category.name}</h1>
          <p className={styles.contentBrief}>View or edit contents of this category, or <span className={styles.contentGoBack}>go back to home content</span></p>

          <button className={styles.contentNewNoteBtn} onClick={() => openNewCategoryNoteModal(k)}>
            <BsPlus />
            Add Note
          </button>

          <div className={styles.contentNoteContainer}>
            {category.notes.map((note, i) => (
              <div key={i} className={styles.note}>
                <h2 className={styles.noteTitle}>{note.title}<span className={styles.noteCreatedAt}>{note.created}</span></h2>

                <div className={styles.noteMethods}>
                  <BsPencilSquare className={styles.noteIcon} onClick={() => openEditCategoryNoteModal(k, i)} />
                  <BsTrash className={styles.noteIcon} onClick={() => deleteCateogryNote(k, i)} />
                  <CgMaximizeAlt className={styles.noteIcon} onClick={() => maximizeCategoryNote(k, i)} />
                  <BsShare className={styles.noteIcon} onClick={() => shareCategoryNote(k, i)} />

                </div>
                <span className={styles.divider}></span>

                <ReactMarkdown className={styles.actualNote}>{note.description}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={`${styles.mainModal} ${newCategoryNoteModalVisible ? '' : styles.hidden}`} data-modal='true' id="new-category-note-modal">

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setNewCategoryNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>New Note</h2>
          <input className={styles.modalInput} id="modal-category-note-title-input" placeholder="enter note title..." />
          <textarea className={styles.modalInputArea} id="modal-category-note-description-input" placeholder="enter note description " />

          <button className={styles.modalBtn} onClick={addNoteToCategory}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editCategoryNoteModalVisible ? '' : styles.hidden}`} id="edit-category-note-modal" data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditCategoryNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Note<br /><span className={styles.noteName} id="category-note-name"></span></h2>
          <input className={styles.modalInput} id="edit-modal-category-note-title-input" placeholder="enter note title..." />
          <textarea className={styles.modalInputArea} id="edit-modal-category-note-description-input" placeholder="enter note description " />

          <button className={styles.modalBtn} onClick={editCategoryNote}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.maxModal} ${maxCategoryNoteModalVisible ? '' : styles.hidden}`}>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => setMaxCategoryNoteModalVisible(false)} />

          <h2 className={styles.noteName} id="max-modal-category-note-title"></h2>
          <ReactMarkdown className={styles.noteContent} id="max-modal-note-content">{categoryNoteMaxModalMarkdownContent}</ReactMarkdown>
        </div>

      </div>

    </div>
  )
}
