import { useEffect, useState } from 'react'
import personService from './services/persons'
import PropTypes from 'prop-types';

Content.propTypes = {
  person: PropTypes.object,
  handleDeleteBtn: PropTypes.func
}

Filter.propTypes = {
  handle: PropTypes.func,
  value: PropTypes.string
}

PersonForm.propTypes = {
  handleNewName: PropTypes.func,
  newName: PropTypes.string,
  handleNewNumber: PropTypes.func,
  newNumber: PropTypes.string,
  addName: PropTypes.func
}

Notification.propTypes = {
  notification: PropTypes.object,
}

const Content = ({ person, handleDeleteBtn }) => {
  return (
    <div>{person.name} {person.number} <button onClick={handleDeleteBtn}>delete</button></div>
  )
}
const Filter = (props) => <div>filter shown with <input onChange={props.handle} value={props.value} /></div>
const PersonForm = (props) => {
  return (
    <form>
      <div>
        name: <input onChange={props.handleNewName} value={props.newName} />
      </div>
      <div>
        number: <input onChange={props.handleNewNumber} value={props.newNumber} />
      </div>
      <div>
        <button type="submit" onClick={props.addName}>add</button>
      </div>
    </form>
  )
}
const Persons = (props) => {
  return (
    props.persons
      .filter(x => props.regexNameFilter
        .test(x.name))
      .map(person => <Content person={person} key={person.id} handleDeleteBtn={() => props.handleDeleteBtn(person)} />)
  )
}
const Notification = ({ notification }) => {
  let messageColor = notification.isSuccess === true ? 'green' : 'red'
  const notificationStyle = {
    color: messageColor,
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderradius: '5px',
    padding: '20px',
    marginbottom: '20px'
  }
  if (notification.message === null) {
    console.log("null")
    return null
  }

  return (
    <>
      <div style={notificationStyle}>
        {notification.message}
      </div>
      <br></br>
    </>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  useEffect(() => {
    personService
      .getAll()
      .then(responseData => {
        setPersons(responseData)
      })
  }, [])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const regexNameFilter = new RegExp(nameFilter, 'i')
  const [notification, setNotification] = useState({ message: null, isSuccess: true })
  const handleNewName = (event) => {
    setNewName(event.target.value)
  }
  const handleNewNumber = (event) => {
    setNewNumber(event.target.value)
  }
  const handleNameFilter = (event) => {
    setNameFilter(event.target.value)
  }
  const addName = (event) => {
    event.preventDefault()
    if (persons.map(x => x.name).includes(newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(x => x.name === newName)
        const personObj = { ...person, number: newNumber }
        personService.update(personObj.id, personObj)
          .then(responseData => {
            setPersons(persons.map(p => p.id !== personObj.id ? p : responseData))
            let messageObject = { message: `Changed number for ${person.name}`, isSuccess: true }
            setNotification(messageObject)
            setTimeout(() => {
              messageObject = { message: null, isSuccess: true }
              setNotification(messageObject)
            }, 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            if (error.request.status === 404) {
              let messageObject = { message: `Information of ${person.name} has already been removed from server`, isSuccess: false }
              setNotification(messageObject)
              setTimeout(() => {
                messageObject = { message: null, isSuccess: true }
                setNotification(messageObject)
              }, 5000)
            } else {
              let messageObject = { message: error.response.data.error, isSuccess: false }
              setNotification(messageObject)
              setTimeout(() => {
                messageObject = { message: null, isSuccess: true }
                setNotification(messageObject)
              }, 5000)
            }
          }
          )
      }
    }
    else {
      const maxID = Math.max(...persons.map(x => x.id))
      const personObject = {
        name: newName,
        number: newNumber,
        id: maxID + 1
      }
      personService
        .create(personObject)
        .then(responseData => {
          setPersons(persons.concat(responseData))
          let messageObject = { message: `Added ${responseData.name}`, isSuccess: true }
          setNotification(messageObject)
          setTimeout(() => {
            messageObject = { message: null, isSuccess: true }
            setNotification(messageObject)
            console.log(notification)
          }, 5000)
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          let messageObject = { message: error.response.data.error, isSuccess: false }
          setNotification(messageObject)
          setTimeout(() => {
            messageObject = { message: null, isSuccess: true }
            setNotification(messageObject)
          }, 5000)
        })
    }
  }
  const handleDeleteBtn = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService.remove(person.id)
        .then(() =>
          setPersons(persons.filter(x => x.id !== person.id))
        )
        .catch(error => {
          if (error.request.status === 404) {
            let messageObject = { message: `Information of ${person.name} has already been removed from server`, isSuccess: false }
            setNotification(messageObject)
            setTimeout(() => {
              messageObject = { message: null, isSuccess: true }
              setNotification(messageObject)
            }, 5000)
          }
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Filter handle={handleNameFilter} value={nameFilter} />
      <h3>add a new</h3>
      <PersonForm handleNewName={handleNewName} handleNewNumber={handleNewNumber} newName={newName} newNumber={newNumber} addName={addName} />
      <h3>Numbers</h3>
      <Persons persons={persons} regexNameFilter={regexNameFilter} handleDeleteBtn={handleDeleteBtn} />
    </div>
  )
}

export default App