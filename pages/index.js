// MAIN IMPORTS
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import ReactMarkdown from 'react-markdown';

import { v4 as uuidv4 } from 'uuid';

// UI IMPORTS
import { BsPlus, BsXLg, BsTrash, BsPencilSquare, BsShare, BsClipboard, BsArrowLeft, BsCheck2, BsHouse, BsFolder } from 'react-icons/bs'
import { CgMaximizeAlt } from 'react-icons/cg'

// HOOKS IMPORTS
import { useEffect, useState } from 'react'
import Link from 'next/link';

export default function Home() {

  // function to format ISO formatted dates to readable dates.
  function formatDate() {

    const date = new Date();

    const formattedDate = Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);

    return formattedDate;

  }

  // the local storage name where data will be stored.
  const notesStorageName = 'chill-notes-data';

  // all the notes data
  const [data, setData] = useState({ notes: [], categories: [] });

  // select mode useStates to define whether notes select mode is enabled or not.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectDivVisible, setSelectDivVisible] = useState(true);

  // whether the move modal (the modal where it shows to move the notes to a category) is visible or not
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  // the visibility useState for the 'new note', 'edit note' and 'maximized note' moddal
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [maxNoteModalVisible, setMaxNoteModalVisible] = useState(false);

  // the state for the note content to show when the note maximize button is clicked 
  const [maxModalMarkdownContent, setmaxModalMarkdownContent] = useState('');
  const [categoryNoteMaxModalMarkdownContent, setCategoryNoteMaxModalMarkdownContent] = useState('');
  const [maxCategoryNoteModalVisible, setMaxCategoryNoteModalVisible] = useState(false);

  // useStates for share popup's visibility, and the share popup link to show when the content is loaded.
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const [sharePopupLink, setSharePopupLink] = useState('');

  // the share modal title and content, changes to 'Generated' when the share link is created.
  const [shareTitleContent, setShareTitleContent] = useState('Generating...');
  const [shareBriefContent, setShareBriefContent] = useState('');

  // useStates()'s for new category modal, edit category modal and the name of the category shown in the category modals. 
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] = useState(false);
  const [modalCategoryName, setModalCategoryName] = useState('');

  // useState for new note in category modal and edit note in category modal.
  const [newCategoryNoteModalVisible, setNewCategoryNoteModalVisible] = useState(false);
  const [editCategoryNoteModalVisible, setEditCategoryNoteModalVisible] = useState(false);

  // Maximize (category) note modal function

  function closeAllMaxNoteModals() {
    setMaxNoteModalVisible(false);
    setMaxCategoryNoteModalVisible(false);
    setSelectDivVisible(true);
  }

  // NOTE METHODS

  const addNote = () => {

    const title = document.getElementById("modal-note-title-input").value;
    const description = document.getElementById("modal-note-description-input").value;

    const formatted = `${formatDate()}`;

    let fnData = { ...data };
    fnData.notes.push({ title, description, created: formatted, strictCreated: Date.now() });

    setData(fnData);
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));


    document.getElementById("modal-note-title-input").value = "";
    document.getElementById("modal-note-description-input").value = "";
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
    document.getElementById("edit-modal-note-title-input").value = data.notes[index].title;
    document.getElementById("edit-modal-note-description-input").value = data.notes[index].description;
  }

  const editNote = () => {

    const title = document.getElementById("edit-modal-note-title-input").value;
    const description = document.getElementById("edit-modal-note-description-input").value;

    const index = Number(document.getElementById("edit-note-modal").getAttribute("data-index"));

    let fnData = { ...data };
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

    setSelectDivVisible(false);
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

    fnData.categories.push({ name: name, created: formatDate(), notes: [] });
    localStorage.setItem(notesStorageName, JSON.stringify(fnData));

    setNewCategoryModalVisible(false);
    document.getElementById('modal-category-name-input').value = "";

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
    document.getElementById('edit-modal-category-name-input').value = data.categories[index].name;

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
    fnData.categories[categoryIndex].notes.push({ title, description, created: formatted, strictCreated: Date.now() });

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

    setSelectDivVisible(false);
    setMaxCategoryNoteModalVisible(true);
  }

  // selection functions

  function unCheckNotes() {
    const selectNoteCheckboxes = document.querySelectorAll('input[type="checkbox"][data-select-note-checkbox]');
    selectNoteCheckboxes.forEach((box) => {
      box.checked = false;
    });
  }

  function setSelectModeFn() {
    unCheckNotes();

    if (selectMode === true) {
      setSelectedNotes([])
    } else {
      // do nothing.
    }
    setSelectMode(prev => !prev);
  }

  function addSelectedNote(event, note, noteIndex, categoryIndex) {
    if (categoryIndex === -1) {
      const checked = event.target.checked;
      if (checked === true) {
        setSelectedNotes((prevSelectedNotes) => [
          ...prevSelectedNotes,
          {
            title: note.title,
            description: note.description,
            created: note.created,
            index: noteIndex,
            categoryIndex: categoryIndex,
            strictCreated: note.strictCreated
          },
        ]);
      } else {
        setSelectedNotes((prevSelectedNotes) =>
          prevSelectedNotes.filter(
            (selectedNote) =>
              selectedNote.index !== noteIndex || selectedNote.categoryIndex !== -1
          )
        );
      }
    } else {
      const checked = event.target.checked;
      if (checked === true) {
        setSelectedNotes((prevSelectedNotes) => [
          ...prevSelectedNotes,
          {
            title: note.title,
            description: note.description,
            created: note.created,
            index: noteIndex,
            categoryIndex: categoryIndex,
            strictCreated: note.strictCreated
          },
        ]);
      } else {
        setSelectedNotes((prevSelectedNotes) =>
          prevSelectedNotes.filter(
            (selectedNote) =>
              selectedNote.index !== noteIndex || selectedNote.categoryIndex !== categoryIndex
          )
        );
      }
    }
  }

  function moveNotes(categoryIndex) {
    const updatedData = { ...data };

    // Helper function to find a note by comparing its properties
    function findNoteIndex(note) {
      return updatedData.notes.findIndex((existingNote) => {
        return (
          existingNote.title === note.title &&
          existingNote.description === note.description &&
          existingNote.strictCreated === note.strictCreated
        );
      });
    }

    // Helper function to remove a note from the data object and categories
    function removeNoteFromDataAndCategories(note) {
      const noteIndex = findNoteIndex(note);
      if (noteIndex !== -1) {
        updatedData.notes.splice(noteIndex, 1);
      }

      updatedData.categories.forEach((category) => {
        const categoryNoteIndex = category.notes.findIndex((categoryNote) => {
          return (
            categoryNote.title === note.title &&
            categoryNote.description === note.description &&
            categoryNote.strictCreated === note.strictCreated
          );
        });
        if (categoryNoteIndex !== -1) {
          category.notes.splice(categoryNoteIndex, 1);
        }
      });
    }

    if (categoryIndex === -1) {
      selectedNotes.forEach((selectedNote) => {
        removeNoteFromDataAndCategories(selectedNote);
        updatedData.notes.push(selectedNote);
      });
    } else {
      const selectedCategory = updatedData.categories[categoryIndex];
      if (selectedCategory) {
        selectedNotes.forEach((selectedNote) => {
          removeNoteFromDataAndCategories(selectedNote);
          selectedCategory.notes.push(selectedNote);
        });
      }
    }

    setData(updatedData);
    localStorage.setItem(notesStorageName, JSON.stringify(updatedData));
    unCheckNotes();
    setSelectMode(false);
    setMoveModalVisible(false);
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
        setNewCategoryModalVisible(false);
        setSharePopupVisible(false);
        setNewCategoryNoteModalVisible(false);
        setEditCategoryNoteModalVisible(false);
        setMoveModalVisible(false);
        closeAllMaxNoteModals();
      }

    });

    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-modal") === 'true') {
          setEditNoteModalVisible(false);
          setNewNoteModalVisible(false);
          setEditCategoryModalVisible(false);
          setNewCategoryModalVisible(false);
          setSharePopupVisible(false);
          setNewCategoryNoteModalVisible(false);
          setEditCategoryNoteModalVisible(false);
          setMoveModalVisible(false);
          closeAllMaxNoteModals();
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
          <button className={`${styles.createNewNoteBtn} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
            if (selectMode === false) {
              setNewNoteModalVisible(true);
            }
          }}>
            <BsPlus className={styles.btnIcon} />
            New Note
          </button>

          <button className={`${styles.createNewNoteBtn} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
            if (selectMode === false) {
              setNewCategoryModalVisible(true);
            }
          }}>
            <BsPlus className={styles.btnIcon} />
            New Category
          </button>
        </div>

        <div className={styles.notesContainer}>

          {data.categories.map((category, k) => (
            <div key={k} className={`${styles.category}`} onClick={(e) => openCategoryContent(e, k)}>
              <h2 className={styles.noteTitle}>
                {category.name}
                <span className={styles.noteCreatedAt}>{category.created}</span>
              </h2>

              <div className={styles.noteMethods}>
                <BsPencilSquare className={`${styles.noteIcon} categoryIcon ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    openEditCategoryModal(k);
                  }
                }} />
                <BsTrash className={`${styles.noteIcon} categoryIcon ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    deleteCategory(k);
                  }
                }} />
              </div>

              <span className={styles.divider}></span>

              <p className={styles.categoryDisclaimer}>Click to view or edit contents</p>
            </div>
          ))}

          {data.notes.map((note, k) => (

            <div key={k} className={styles.note}>
              <h2 className={styles.noteTitle}>
                <input className={`${styles.selectNoteCheckbox} ${selectMode === false ? styles.hiddenIcon : ''}`} data-select-note-checkbox type="checkbox" onInput={(e) => addSelectedNote(e, note, k, -1)} /> {/* -1 in the last parameter to show this is not in a category */}
                {note.title}<span className={styles.noteCreatedAt}>{note.created}</span>
              </h2>

              <div className={styles.noteMethods}>

                <BsPencilSquare className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    openEditNoteModal(k);
                  }
                }} />

                <BsTrash className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    deleteNote(k);
                  }
                }} />
                <CgMaximizeAlt className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    maximizeNote(k);
                  }
                }} />
                <BsShare className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
                  if (selectMode === false) {
                    shareNote(k);
                  }
                }} />

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
          <input className={styles.modalInput} id="modal-note-title-input" placeholder="enter note title..." tabIndex={newNoteModalVisible ? 0 : -1} />
          <textarea className={styles.modalInputArea} id="modal-note-description-input" placeholder="enter note description " tabIndex={newNoteModalVisible ? 0 : -1} />

          <button className={styles.modalBtn} onClick={addNote} tabIndex={newNoteModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editNoteModalVisible ? '' : styles.hidden}`} id="edit-note-modal" data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Note<br /><span className={styles.noteName} id="note-name"></span></h2>
          <input className={styles.modalInput} id="edit-modal-note-title-input" placeholder="enter note title..." tabIndex={editNoteModalVisible ? 0 : -1} />
          <textarea className={styles.modalInputArea} id="edit-modal-note-description-input" placeholder="enter note description " tabIndex={editNoteModalVisible ? 0 : -1} />

          <button className={styles.modalBtn} onClick={editNote} tabIndex={editNoteModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.maxModal} ${maxNoteModalVisible ? '' : styles.hidden}`} data-modal='true'>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => {
            setMaxNoteModalVisible(false);
            setSelectDivVisible(true);
          }} />

          <h2 className={styles.noteName} id="max-modal-note-title"></h2>
          <ReactMarkdown className={styles.noteContent} id="max-modal-note-content">{maxModalMarkdownContent}</ReactMarkdown>
        </div>

      </div>

      <div className={`${styles.sharePopup} ${sharePopupVisible ? '' : styles.hidden}`} style={{ zIndex: 999 }} data-modal='true'>

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
          <input className={styles.modalInput} id="modal-category-name-input" placeholder="enter category name..." tabIndex={newCategoryModalVisible ? 0 : -1} />
          <button className={styles.modalBtn} onClick={addCategory} tabIndex={newCategoryModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editCategoryModalVisible ? '' : styles.hidden}`} data-modal='true' id='edit-category-modal'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditCategoryModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Category<br /><span className={styles.modalCategoryName}>({modalCategoryName})</span></h2>
          <input className={styles.modalInput} id="edit-modal-category-name-input" placeholder="enter new category name..." tabIndex={editCategoryModalVisible ? 0 : -1} />
          <button className={styles.modalBtn} onClick={editCategory} tabIndex={editCategoryModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      {data.categories.map((category, k) => (
        <div key={k} className={`${styles.categoryContent} ${k}`} id={`categoryContent${k}`} data-hidden>
          <BsArrowLeft className={styles.categorybackHome} onClick={() => hideCategoryContent(k)} />
          <h1 className={styles.contentTitle}>{category.name}</h1>
          <p className={styles.contentBrief}>View or edit contents of this category, or <span className={styles.contentGoBack}>go back to home content</span></p>

          <button className={`${styles.contentNewNoteBtn} ${selectMode === true ? styles.noClick : ''}`} onClick={() => {
            if (selectMode === false) {
              openNewCategoryNoteModal(k);
            }
          }}>
            <BsPlus />
            Add Note
          </button>

          <div className={styles.contentNoteContainer}>
            {category.notes.map((note, i) => (
              <div key={i} className={styles.note}>
                <h2 className={styles.noteTitle}>
                  <input className={`${styles.selectNoteCheckbox} ${selectMode === false ? styles.hiddenIcon : ''}`} data-select-note-checkbox type="checkbox" onInput={(e) => addSelectedNote(e, note, i, k)} />
                  {note.title}<span className={styles.noteCreatedAt}>{note.created}</span>
                </h2>

                <div className={styles.noteMethods}>
                  <BsPencilSquare className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => openEditCategoryNoteModal(k, i)} />
                  <BsTrash className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => deleteCateogryNote(k, i)} />
                  <CgMaximizeAlt className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => maximizeCategoryNote(k, i)} />
                  <BsShare className={`${styles.noteIcon} ${selectMode === true ? styles.noClick : ''}`} onClick={() => shareCategoryNote(k, i)} />

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
          <input className={styles.modalInput} id="modal-category-note-title-input" placeholder="enter note title..." tabIndex={newCategoryNoteModalVisible ? 0 : -1} />
          <textarea className={styles.modalInputArea} id="modal-category-note-description-input" placeholder="enter note description " tabIndex={newCategoryNoteModalVisible ? 0 : -1} />

          <button className={styles.modalBtn} onClick={addNoteToCategory} tabIndex={newCategoryNoteModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.mainModal} ${editCategoryNoteModalVisible ? '' : styles.hidden}`} id="edit-category-note-modal" data-modal='true'>

        <div className={styles.modal}>

          <BsXLg className={styles.modalClose} onClick={() => setEditCategoryNoteModalVisible(false)} />

          <h2 className={styles.modalTitle}>Edit Note<br /><span className={styles.noteName} id="category-note-name"></span></h2>
          <input className={styles.modalInput} id="edit-modal-category-note-title-input" placeholder="enter note title..." tabIndex={editCategoryNoteModalVisible ? 0 : -1} />
          <textarea className={styles.modalInputArea} id="edit-modal-category-note-description-input" placeholder="enter note description " tabIndex={editCategoryNoteModalVisible ? 0 : -1} />

          <button className={styles.modalBtn} onClick={editCategoryNote} tabIndex={editCategoryNoteModalVisible ? 0 : -1}>Confirm</button>

        </div>

      </div>

      <div className={`${styles.maxModal} ${maxCategoryNoteModalVisible ? '' : styles.hidden}`} data-modal='true'>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => {
            setMaxCategoryNoteModalVisible(false);
            setSelectDivVisible(true);
          }} />

          <h2 className={styles.noteName} id="max-modal-category-note-title"></h2>
          <ReactMarkdown className={styles.noteContent} id="max-modal-note-content">{categoryNoteMaxModalMarkdownContent}</ReactMarkdown>
        </div>

      </div>

      <div className={`${styles.selectModeDiv} ${selectDivVisible ? '' : styles.hidden}`}>

        <button className={`${styles.moveNotesBtn} ${styles.selectModeDivBtn} ${selectMode === false || selectedNotes.length === 0 ? styles.noClick : ''}`} onClick={() => setMoveModalVisible(true)}>Move To</button> {/* checks whether the selectMode is false, then add the noClick class OR if the selected notes array is empty, meaning no notes to move anywhere, so it is still noClick. otherwise, no class. */}
        <button className={`${styles.selectNotesBtn} ${styles.selectModeDivBtn}`} onClick={() => setSelectModeFn()}>{selectMode === true ? 'Cancel' : 'Select'}</button>

      </div>

      <div className={`${styles.mainModal} ${styles.moveModal} ${moveModalVisible ? '' : styles.hidden}`} data-modal='true'>

        <div className={styles.modal}>
          <BsXLg className={styles.modalClose} onClick={() => {
            setMoveModalVisible(false);
            setSelectedNotes([]);
            setSelectMode(false);
            unCheckNotes();
          }} />

          <h2 className={styles.modalTitle} id="move-modal-title">Move To...</h2>
          <div className={styles.moveModalContentContainer} id="move-modal-content-container">
            <span className={styles.moveModalItem} data-root-item onClick={() => moveNotes(-1)}> {/* indicates that this item is the root of the notes, no categories */}
              <BsHouse className={styles.itemIcon} />
              Home Category

              <BsCheck2 className={styles.selectedIcon} />
            </span>
            {data.categories.map((category, k) => (
              <span className={styles.moveModalItem} key={k} onClick={() => moveNotes(k)}>
                <BsFolder className={styles.itemIcon} />
                {category.name}
                <BsCheck2 className={styles.selectedIcon} />
              </span>
            ))}
          </div>

          <span className={styles.modalDisclaimer}>Click on the desired category to move the selected notes to that category</span>
        </div>

      </div>

    </div>
  )
}
