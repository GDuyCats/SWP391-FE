import { useState, useEffect } from "react"
import { Plus } from 'lucide-react';
import axios from 'axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    handleGetAllUsers()
  }, [])

  const handleGetAllUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8888/users')
      setUsers(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUsers = async (req, res) => {
    try {
      await axios.post('http://localhost:8888/users')
    } catch (error) {

    } finally {

    }

  }

  if (loading) return <p>Loading ...</p>
  return (
    <div className="w-full h-full relative">
      <Plus
        className="w-[50px] hover:cursor-pointer hover:scale-125 transition-transform duration-200"
        onClick={() => setOpenModal(true)}
      />
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.fullname}</li>
        ))}
      </ul>
      {openModal && (
        <div className="fixed flex inset-0 bg-black/70 w-screen h-screen justify-center items-center" onClick={() => setOpenModal(false)}>
          <div className="bg-white w-[800px] h-[800px] rounded-2xl">
            Hi
          </div>
        </div>
      )}
    </div>
  )
}
