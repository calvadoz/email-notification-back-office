'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { parseISO } from 'date-fns/fp'
import io from 'socket.io-client'

type EmailNotificationType = {
  id: string
  recipient: string
  status: string
  timestamp: string
}

type EmailMessage = {
  to: string
  subject?: string
  message?: string
}

type MessageBody = {
  _id: string
  payload: EmailMessage
  status?: string
  timestamp?: string
}

export default function Home() {
  const [emailList, setEmailList] = useState<EmailNotificationType[]>([])
  const BASE_URI = 'http://localhost:4000'

  useEffect(() => {
    const socket = io(BASE_URI)

    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
    })

    socket.on('message', (message) => {
      console.log('Received message:', message)
      // fetch all / find by id and update specific id, tbd
    })

    // clean up unclosed connection just in case
    return () => {
      socket.disconnect() 
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URI}/api/email/list`)
      const mappedResponse = response.data.map((data: MessageBody) => {
        const emailNotification: EmailNotificationType = {
          id: data._id,
          recipient: data.payload.to,
          status: data.status || '',
          timestamp: convertDateToHumanReadableFormat(data.timestamp || '')
        }
        return emailNotification
      })
      // console.log(mappedResponse)
      setEmailList(mappedResponse)
    } catch (error) {
      setEmailList([])
      console.error('Error fetching data: ', error)
    }
  }

  const convertDateToHumanReadableFormat = (dateString: string) => {
    const date = parseISO(dateString)
    const formattedDate = formatDistanceToNow(date, { addSuffix: true })
    return formattedDate || ''
  }

  return (
    <>
      {emailList.length <= 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="container mx-auto flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold my-4">
          Email Notification Service as of{' '}
          {new Date(Date.now()).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </h1>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {emailList.map((message: any, index) => (
                <tr key={message.id}>
                  <td className="border px-4 py-2">{message.id}</td>
                  <td className="border px-4 py-2">{message.recipient}</td>
                  <td className="border px-4 py-2">{message.status}</td>
                  <td className="border px-4 py-2">{message.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
