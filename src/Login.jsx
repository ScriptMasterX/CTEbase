import React, { useState } from 'react';
import { app, db } from './firebaseConfig'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import './Login.css'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore"; 

async function fetchDataFromFirestore() {
  const colRef = collection(db, "partners");
  const docsSnap = await getDocs(colRef);
  const data = []
  docsSnap.forEach(doc => {
      data.push({id: doc.id, ...doc.data()})
  })
  return data
}


export default function Login() {
  const [data, setData] = useState([])
  const [searchValue, setSearchValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('name');
  const [partnerData, setPartnerData] = useState({
    name: '',
    contacts: '',
    notes: '',
    website: '',
    description: '',
    Location: ''
  })
  const [currentPage, setCurrentPage] = useState(1);
  const partnersPerPage = 10;

  const indexOfLastPartner = currentPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const currentPartners = data.slice(indexOfFirstPartner, indexOfLastPartner);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isTRModalOpen, setIsTRModalOpen] = useState(false);
  function handleNameData(event) {
      setPartnerData(prevState => ({
        ...prevState,
        name: event.target.value
      }));
    };
  function handleContactsData(event) {
    setPartnerData(prevState => ({
      ...prevState,
      contacts: event.target.value
    }));
  };
  function handleNotesData(event) {
    setPartnerData(prevState => ({
      ...prevState,
      notes: event.target.value
    }));
  };
  function handleWebsiteData(event) {
    setPartnerData(prevState => ({
      ...prevState,
      website: event.target.value
    }));
  };
  function handleLocationData(event) {
    setPartnerData(prevState => ({
      ...prevState,
      Location: event.target.value
    }));
  };
  function handleDescriptionData(event) {
    setPartnerData(prevState => ({
      ...prevState,
      description: event.target.value
    }));
  };
  React.useEffect(() => {
    async function fetchData() {
      const data = await fetchDataFromFirestore()
      setData(data)
    }
    fetchData()
  }, [])
  let auth = getAuth();
  const [information, setInformation] = useState({
    signUpEmail: '',
    signUpPassword: '',
    signInEmail: '',
    signInPassword: ''
  })
  const [loginStatus, setLoginStatus] = useState(false)
  React.useEffect(() => {
    const storedLoginStatus = localStorage.getItem('loginStatus');
    if (storedLoginStatus === 'true') {
      setLoginStatus(true);
    }
  }, []);
  function handleSignUpEmailChange(event) {
    setInformation(prevState => ({
      ...prevState,
      signUpEmail: event.target.value
    }));
  };
  function handleSignUpPasswordChange(event) {
    setInformation(prevState => ({
      ...prevState,
      signUpPassword: event.target.value
    }));
  };
  function handleSignInEmailChange(event) {
    setInformation(prevState => ({
      ...prevState,
      signInEmail: event.target.value
    }));
  };
  function handleSignInPasswordChange(event) {
    setInformation(prevState => ({
      ...prevState,
      signInPassword: event.target.value
    }));
  };
  function handleSigninSubmit(event) {
    event.preventDefault();
    signInWithEmailAndPassword(auth, information.signInEmail, information.signInPassword)
      .then(res => {
        setLoginStatus(true)
        localStorage.setItem('loginStatus', 'true')
      })
      .catch(err => {
        alert(err.message)
      })
  };
  function handleSignupSubmit(event) {
    event.preventDefault();
    createUserWithEmailAndPassword(auth, information.signUpEmail, information.signUpPassword)
      .then(res => {
        setLoginStatus(true)
      })
      .catch(err => {
        alert(err.message)
      })
  };
  
  function createPreview(text) {
      var preview = text.substring(0, 30);
      preview += "...";
      return preview;
  }
  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };
  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };
  function filter(event) {
    event.preventDefault();

    async function fetchDataAndFilter() {
      const data = await fetchDataFromFirestore();

      const newList = data.filter(item =>
        item[selectedValue].toLowerCase().includes(searchValue.toLowerCase())
      );

      setData(newList);
    }

    fetchDataAndFilter();
  }
  function reset() {
    setSearchValue('');
    setSelectedValue('name');
    async function fetchData() {
      const data = await fetchDataFromFirestore()
      setData(data)
    }
    fetchData()
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  React.useEffect(() => {
    if (isDialogOpen || isTRModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDialogOpen, isTRModalOpen]);

  function addPartner() {
    if (partnerData.name && partnerData.contacts && partnerData.website && partnerData.description && partnerData.Location)
    addDoc(collection(db, "partners"), {
      name: partnerData.name,
      website: partnerData.website,
      Location: partnerData.Location,
      description: partnerData.description,
      contacts: partnerData.contacts,
      notes: partnerData.notes ? partnerData.notes : 'none'
    })
      .then(res => {
        
        setPartnerData({
          name: '',
          contacts: '',
          website: '',
          description: '',
          Location: '',
          notes: ''
        });
        closeDialog()
        fetchDataFromFirestore().then(newData => {
          setData(newData);
        });
      })
  }
  function handleRowClick(partner) {
    setSelectedPartner(partner);
    setEditedPartnerData(partner);
    setIsTRModalOpen(true);
  }

  function closeTRModal() {
    setSelectedPartner(null);
    setIsTRModalOpen(false);
  }

  const [editedPartnerData, setEditedPartnerData] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  function handleEditField(fieldName, event) {
    const value = event.target.value;
    setEditedPartnerData(prevState => ({
      ...prevState,
      [fieldName]: value
    }));
    setEditedFields(prevState => ({
      ...prevState,
      [fieldName]: value !== selectedPartner[fieldName]
    }));
  }
  
  
  // Similar functions for other fields like contacts, notes, website, etc.

  function confirmEdit() {
      // Update the original data with the edited data
    let editedPartner;
    const updatedData = data.map(partner => {
      if (partner.id === editedPartnerData.id) {
        editedPartner = editedPartnerData;
        return editedPartnerData;
      } else {
        return partner;
      }
    });
    const partnerRef = doc(db, "partners", editedPartnerData.id);
  
    updateDoc(partnerRef, {
      name: editedPartner.name,
      Location: editedPartner.Location,
      website: editedPartner.website,
      description: editedPartner.description,
      contacts: editedPartner.contacts,
      notes: editedPartner.notes
    })
      .then(res =>{
        closeTRModal();
        setEditedFields({});
        reset()
      })
      .catch(error => {
        console.error("Error updating document: ", error);
      });
  }
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  function deletePartner() {
    if (selectedPartner) {
      const partnerRef = doc(db, "partners", selectedPartner.id);
      deleteDoc(partnerRef)
        .then(() => {
          closeTRModal();
          closeDeleteModal()
          reset();
        })
        .catch((error) => {
          console.error("Error deleting partner: ", error);
        });
    } else {
      console.warn("No partner selected for deletion");
    }
  }

  function confirmDelete() {
    deletePartner();
    closeDeleteModal();
  }
  return (
    <main className='pageMain'>
      <div className={`loginBackground ${loginStatus ? 'white' : 'linear'}`}>
        <div className="main" style={{display: loginStatus ? 'none' : 'block'}}>  	
          <input type="checkbox" id="chk" aria-hidden="" />
            <div className="signup">
              <form onSubmit={handleSignupSubmit}>
                <label htmlFor="chk" aria-hidden="true">Sign up</label>
                <input 
                  type="text"
                  value={information.signUpEmail}
                  onChange={handleSignUpEmailChange}
                  placeholder="Email" 
                  required="" 
                />
                <input 
                  type="password"
                  value={information.signUpPassword}
                  onChange={handleSignUpPasswordChange}
                  placeholder="Password" 
                  required=""
                />
                <button type='submit'>Sign up</button>
              </form>
            </div>
  
          <div className="login">
            <form onSubmit={handleSigninSubmit}>
              <label htmlFor="chk" aria-hidden="true">Sign In</label>
              <input 
                type="text"
                value={information.signInEmail}
                onChange={handleSignInEmailChange}
                placeholder="Email" 
                required="" 
              />
              <input 
                type="password"
                value={information.signInPassword}
                onChange={handleSignInPasswordChange}
                placeholder="Password" 
                required=""
              />
              <button type='submit'>Sign In</button>
            </form>
          </div>
        </div>
        {/*  */}
      </div>
      
      <div className="searchPage" style={{overflowY: 'hidden'}}>
        <div className="topWrapper">
        <h1 className="welcome">Welcome to CTEBase!</h1>
        <form className="searchForm" onSubmit={filter} >
          <button className="resetButton" type='button' onClick={reset}>Reset</button>
          <p style={{fontSize: '20px', fontWeight: 'bold', paddingRight: '8 px'}}>Search By: </p>
          <select value={selectedValue} onChange={handleSelectChange} id="search-by">
            <option value="name">Organization Name</option>
            <option value="Location">Location</option>
            <option value="contacts">Contacts</option>
            <option value="description">Description</option>
            <option value="description">Website</option>
            <option value="description">Description</option>

          </select>
          <input
            className='searchBar'
            type="text"
            placeholder="Search"
            value={searchValue} // Bind input value to state
            onChange={handleInputChange} // Call handleInputChange on input change
          />
          <button type="submit">Go</button>
        </form>
        </div>
        <hr />
        <table className="dataTable">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Country</th>
              <th>Description</th>
              <th>Website</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {currentPartners.map((partner) => (
              <tr key={partner.id} className="trBlock" onClick={() => handleRowClick(partner)}>
                <td>{partner.name}</td>
                <td>{partner.contacts}</td>
                <td>{createPreview(partner.Location)}</td>
                <td>{createPreview(partner.description)}</td>
                <td>
                  <a href={partner.website} target="_blank">{partner.website}</a>
                </td>
                <td>{partner.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <button onClick={nextPage} disabled={indexOfLastPartner >= data.length}>
            Next
          </button>
        </div>
        {isTRModalOpen && selectedPartner && (
          <>
            <div className="backdrop" onClick={closeTRModal}></div>
            <div className="modal">
              <div className="modalHeader" style={{paddingTop: '20px', paddingBottom: '20px'}}>
                <span>{selectedPartner.name}</span>
                <span className="closeButton" onClick={closeTRModal}>&times;</span>
              </div>
              <hr style={{margin: "15px -16px 15px"}} />
              <div className="modal-content">
                
                  <label className="addCompanyLabel">Name</label>
                  <input 
                    type="text" 
                    placeholder="Google"
                    value={editedPartnerData.name}
                    onChange={() => handleEditField('name', event)}
                  />

                  <label className="addCompanyLabel">Contacts</label>
                  <input 
                    placeholder="+1 (293) 200-2990"
                    value={editedPartnerData.contacts}
                    onChange={() => handleEditField('contacts', event)}
                   />

                  <label className="addCompanyLabel">Notes</label>
                  <input 
                    type="text" 
                    placeholder="Notes..." 
                    value={editedPartnerData.notes}
                    onChange={() => handleEditField('notes', event)}
                  />
                  <label className="addCompanyLabel">Website</label>
                  <input 
                    type="text" 
                    placeholder="www.https://amazon.com"
                    value={editedPartnerData.website}
                    onChange={() => handleEditField('website', event)}
                  />
                  <label className="addCompanyLabel">Location</label>
                  <input 
                    type="text" 
                    placeholder="San Francisco, CA"
                    value={editedPartnerData.Location}
                    onChange={() => handleEditField('Location', event)}
                  />
                  <label className="addCompanyLabel">Description</label>
                  <textarea 
                    type="text" 
                    placeholder="Description..."
                    value={editedPartnerData.description}
                    onChange={() => handleEditField('description', event)}
                  />
                <div className="buttonWrapper">
                  <button className={`addCompanyButton ${Object.values(editedFields).some(field => field) ? 'blue' : 'grey'}`} onClick={confirmEdit} disabled={!Object.values(editedFields).some(field => field)}>
                    Confirm Edit
                  </button>
                  <button onClick={openDeleteModal} className="delete">Delete</button>
                  
                </div>
              </div>
              
            </div>
            {isDeleteModalOpen && (
              <>
                <div className="backdrop" onClick={closeDeleteModal}></div>
                <div className="modal deleteModal">
                  <div className="modalHeader">
                    <span>Delete Partner</span>
                    <span className="closeButton" onClick={closeDeleteModal}>
                      &times;
                    </span>
                  </div>
                  <hr style={{ margin: "15px -16px 15px" }} />
                  <div className="modal-content" style={{textAlign: 'center'}}>
                    <p>Are you sure you want to delete this partner?</p>
                    <div className="buttonWrapper">
                      <button className="delete" onClick={confirmDelete}>
                        Confirm
                      </button>
                      <button style={{width: '100px', background: '#4461d5'}} onClick={closeDeleteModal}>Cancel</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <div className="addCompanyButtonContainer">
          <button className="addCompanyButton" onClick={openDialog}>Add Company</button>
          {isDialogOpen && (
            <>
              <div className="backdrop" onClick={closeDialog}></div>
              <dialog open className="modal">
                <div className="modalContent">
                  
                  <div className="modalHeader">
                  <span>Add Company</span>
                    <button className="closeButton" onClick={closeDialog}>&times;</button>
                    </div>
                  <hr style={{margin: "15px -16px 15px"}} />
                  <div className="addCompanyLabelDiv">
                    <label className="addCompanyLabel">Name</label>
                    <input 
                      type="text" 
                      placeholder="Google"
                      value={partnerData.name}
                      onChange={handleNameData}
                    />
                    
                    <label className="addCompanyLabel">Contacts</label>
                    <input 
                      placeholder="+1 (293) 200-2990"
                      value={partnerData.contacts}
                      onChange={handleContactsData}
                     />
                    </div>
                  
                  <div className="addCompanyLabelDiv">
                    <label className="addCompanyLabel">Notes</label>
                    <input 
                      type="text" 
                      placeholder="Notes..." 
                      value={partnerData.notes}
                      onChange={handleNotesData}
                    />
                    <label className="addCompanyLabel">Website</label>
                    <input 
                      type="text" 
                      placeholder="www.https://amazon.com"
                      value={partnerData.website}
                      onChange={handleWebsiteData}
                    />
                  </div>
                  <div className="addCompanyLabelDiv">
                    <label className="addCompanyLabel">Location</label>
                    <input 
                      type="text" 
                      placeholder="San Francisco, CA"
                      value={partnerData.Location}
                      onChange={handleLocationData}
                    />
                    <label className="addCompanyLabel">Description</label>
                    <input 
                      type="text" 
                      placeholder="Description..."
                      value={partnerData.description}
                      onChange={handleDescriptionData}
                    />
                  </div>
                  <button className="addCompanyButton" onClick={addPartner}>Confirm</button>
                </div>
              </dialog>
            </>
          )}
        </div>
      </div>
    </main>
  );
};