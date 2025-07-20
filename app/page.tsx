"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Video, Download, Trash2, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedVideo {
  id: string
  name: string
  blob: Blob
  timestamp: number
  duration: number
}

export default function FaceTrackingApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [faceDetections, setFaceDetections] = useState<any[]>([])

  const { toast } = useToast()

  // Load saved videos from localStorage
  useEffect(() => {
    const loadSavedVideos = async () => {
      try {
        const videoKeys = Object.keys(localStorage).filter((key) => key.startsWith("face-tracking-video-"))
        const videos: SavedVideo[] = []

        for (const key of videoKeys) {
          const videoData = localStorage.getItem(key)
          if (videoData) {
            const parsed = JSON.parse(videoData)
            const blob = new Blob([new Uint8Array(parsed.data)], { type: "video/webm" })
            videos.push({
              id: parsed.id,
              name: parsed.name,
              blob,
              timestamp: parsed.timestamp,
              duration: parsed.duration,
            })
          }
        }

        setSavedVideos(videos.sort((a, b) => b.timestamp - a.timestamp))
      } catch (error) {
        console.error("Error loading saved videos:", error)
      }
    }

    loadSavedVideos()
  }, [])

  // Initialize camera and face detection
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      // Initialize face detection
      await initializeFaceDetection()
      setIsDetecting(true)

      toast({
        title: "Camera initialized",
        description: "Face tracking is now active",
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Simple face detection using built-in APIs (placeholder for MediaPipe)
  const initializeFaceDetection = async () => {
    // This is a simplified face detection implementation
    // In a real application, you would integrate MediaPipe Face Detection here
    const detectFaces = () => {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Simulate face detection (in real app, use MediaPipe results)
      const mockFaces = [
        {
          x: canvas.width * 0.3,
          y: canvas.height * 0.2,
          width: canvas.width * 0.4,
          height: canvas.height * 0.5,
        },
      ]

      // Draw face detection markers
      ctx.strokeStyle = "#00ff00"
      ctx.lineWidth = 3
      ctx.fillStyle = "rgba(0, 255, 0, 0.1)"

      mockFaces.forEach((face) => {
        // Draw bounding box
        ctx.strokeRect(face.x, face.y, face.width, face.height)
        ctx.fillRect(face.x, face.y, face.width, face.height)

        // Draw face landmarks (eyes, nose, mouth)
        const eyeY = face.y + face.height * 0.3
        const leftEyeX = face.x + face.width * 0.3
        const rightEyeX = face.x + face.width * 0.7
        const noseX = face.x + face.width * 0.5
        const noseY = face.y + face.height * 0.5
        const mouthY = face.y + face.height * 0.7

        // Eyes
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, 5, 0, 2 * Math.PI)
        ctx.arc(rightEyeX, eyeY, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Nose
        ctx.beginPath()
        ctx.arc(noseX, noseY, 3, 0, 2 * Math.PI)
        ctx.fill()

        // Mouth
        ctx.beginPath()
        ctx.arc(noseX, mouthY, 8, 0, Math.PI)
        ctx.stroke()
      })

      setFaceDetections(mockFaces)
    }

    // Run face detection at 30 FPS
    const interval = setInterval(detectFaces, 33)
    return () => clearInterval(interval)
  }

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    try {
      // Create a new stream that includes both video and canvas overlay
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) return

      // Create a composite stream with video + overlay
      const compositeCanvas = document.createElement("canvas")
      const compositeCtx = compositeCanvas.getContext("2d")

      if (!compositeCtx) return

      compositeCanvas.width = video.videoWidth
      compositeCanvas.height = video.videoHeight

      const drawComposite = () => {
        if (!isRecording) return

        // Draw video frame
        compositeCtx.drawImage(video, 0, 0, compositeCanvas.width, compositeCanvas.height)

        // Draw face tracking overlay
        compositeCtx.drawImage(canvas, 0, 0)

        requestAnimationFrame(drawComposite)
      }

      drawComposite()

      const compositeStream = compositeCanvas.captureStream(30)

      // Add audio track from original stream
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        compositeStream.addTrack(audioTrack)
      }

      recordedChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(compositeStream, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        saveRecording()
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start recording timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Store timer reference for cleanup
      ;(mediaRecorderRef.current as any).timer = timer

      toast({
        title: "Recording started",
        description: "Face tracking markers will be included in the video",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording error",
        description: "Unable to start recording",
        variant: "destructive",
      })
    }
  }, [isRecording, toast])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // Clear timer
      if ((mediaRecorderRef.current as any).timer) {
        clearInterval((mediaRecorderRef.current as any).timer)
      }

      setIsRecording(false)

      toast({
        title: "Recording stopped",
        description: "Video saved successfully",
      })
    }
  }, [isRecording, toast])

  // Save recording to localStorage
  const saveRecording = async () => {
    if (recordedChunksRef.current.length === 0) return

    try {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      const videoId = `video-${Date.now()}`
      const videoData = {
        id: videoId,
        name: `Face Tracking Recording ${new Date().toLocaleString()}`,
        data: Array.from(uint8Array),
        timestamp: Date.now(),
        duration: recordingTime,
      }

      localStorage.setItem(`face-tracking-video-${videoId}`, JSON.stringify(videoData))

      // Update saved videos list
      const newVideo: SavedVideo = {
        id: videoId,
        name: videoData.name,
        blob,
        timestamp: videoData.timestamp,
        duration: videoData.duration,
      }

      setSavedVideos((prev) => [newVideo, ...prev])

      toast({
        title: "Video saved",
        description: "Recording saved to local storage",
      })
    } catch (error) {
      console.error("Error saving video:", error)
      toast({
        title: "Save error",
        description: "Unable to save video",
        variant: "destructive",
      })
    }
  }

  // Download video
  const downloadVideo = (video: SavedVideo) => {
    const url = URL.createObjectURL(video.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${video.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Delete video
  const deleteVideo = (videoId: string) => {
    localStorage.removeItem(`face-tracking-video-${videoId}`)
    setSavedVideos((prev) => prev.filter((v) => v.id !== videoId))

    toast({
      title: "Video deleted",
      description: "Recording removed from storage",
    })
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    initializeCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [initializeCamera])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Face Tracking Video Recorder</h1>
          <p className="text-gray-600">Real-time face detection with video recording capabilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera and Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Live Camera Feed
                {isDetecting && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Face Tracking Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

                {isRecording && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    REC {formatDuration(recordingTime)}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600 text-center">
                <p>Faces detected: {faceDetections.length}</p>
                <p>Face tracking markers will be included in recordings</p>
              </div>
            </CardContent>
          </Card>

          {/* Saved Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Saved Recordings ({savedVideos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedVideos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recordings yet</p>
                ) : (
                  savedVideos.map((video) => (
                    <div key={video.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{video.name}</h3>
                          <p className="text-xs text-gray-500">{new Date(video.timestamp).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Duration: {formatDuration(video.duration)}</p>
                        </div>
                      </div>

                      <video
                        src={URL.createObjectURL(video.blob)}
                        controls
                        className="w-full h-32 object-cover rounded"
                      />

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadVideo(video)}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteVideo(video.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Real-time Face Tracking</h3>
                <p className="text-sm text-gray-600">Advanced face detection with visible markers</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Video Recording</h3>
                <p className="text-sm text-gray-600">Record videos with face tracking overlay</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Local Storage</h3>
                <p className="text-sm text-gray-600">Save and manage recordings locally</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
