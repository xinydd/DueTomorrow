import { useState, useRef, useEffect } from 'react'
import { Camera, X, AlertTriangle, CheckCircle, Loader2, Eye, Zap } from 'lucide-react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'

const AICameraScan = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const webcamRef = useRef(null)
  const [model, setModel] = useState(null)

  // Load MobileNet model for object detection
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load MobileNet model for object detection
        const mobilenet = await tf.loadLayersModel('https://tfhub.dev/google/tfjs-model/mobilenet_v2_1.0_224/1/default/1')
        setModel(mobilenet)
      } catch (error) {
        console.error('Error loading model:', error)
        // Fallback to a simpler approach if model loading fails
      }
    }
    loadModel()
  }, [])

  const captureImage = () => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot()
    }
    return null
  }

  const analyzeImage = async (imageData) => {
    try {
      setIsScanning(true)
      
      // Create image element for analysis
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            // Analyze brightness (for dark alley detection)
            const brightness = analyzeBrightness(imageData)
            
            // Analyze colors (for environment detection)
            const colorAnalysis = analyzeColors(imageData)
            
            // Analyze patterns (for corridor detection)
            const patternAnalysis = analyzePatterns(imageData)
            
            // Combine analysis results
            const result = {
              brightness: brightness,
              colors: colorAnalysis,
              patterns: patternAnalysis,
              safetyScore: calculateSafetyScore(brightness, colorAnalysis, patternAnalysis),
              recommendations: generateRecommendations(brightness, colorAnalysis, patternAnalysis),
              timestamp: new Date().toISOString()
            }
            
            resolve(result)
          } catch (error) {
            console.error('Analysis error:', error)
            resolve({
              error: 'Analysis failed',
              safetyScore: 50,
              recommendations: ['Unable to analyze environment. Please ensure good lighting.']
            })
          }
        }
        
        img.src = imageData
      })
    } catch (error) {
      console.error('Error in analyzeImage:', error)
      return {
        error: 'Analysis failed',
        safetyScore: 50,
        recommendations: ['Unable to analyze environment. Please try again.']
      }
    }
  }

  const analyzeBrightness = (imageData) => {
    const data = imageData.data
    let totalBrightness = 0
    let pixelCount = 0
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Calculate perceived brightness
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      totalBrightness += brightness
      pixelCount++
    }
    
    const averageBrightness = (totalBrightness / pixelCount) * 100
    
    return {
      level: averageBrightness,
      status: averageBrightness < 30 ? 'dark' : averageBrightness < 60 ? 'dim' : 'bright',
      description: averageBrightness < 30 ? 'Very dark environment detected' : 
                   averageBrightness < 60 ? 'Dim lighting detected' : 'Good lighting'
    }
  }

  const analyzeColors = (imageData) => {
    const data = imageData.data
    let colorCounts = { red: 0, green: 0, blue: 0, gray: 0, other: 0 }
    let pixelCount = 0
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Determine dominant color
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      
      if (max - min < 30) {
        colorCounts.gray++
      } else if (r > g && r > b) {
        colorCounts.red++
      } else if (g > r && g > b) {
        colorCounts.green++
      } else if (b > r && b > g) {
        colorCounts.blue++
      } else {
        colorCounts.other++
      }
      pixelCount++
    }
    
    const dominantColor = Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    )
    
    return {
      dominant: dominantColor,
      distribution: colorCounts,
      environment: dominantColor === 'gray' ? 'indoor/corridor' : 'outdoor'
    }
  }

  const analyzePatterns = (imageData) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Detect vertical lines (corridor walls)
    let verticalLines = 0
    let horizontalLines = 0
    
    // Sample analysis for performance
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const index = (y * width + x) * 4
        
        if (index < data.length - 4) {
          // Simple edge detection
          const current = data[index]
          const right = data[index + 4] || current
          const below = data[index + width * 4] || current
          
          if (Math.abs(current - right) > 30) verticalLines++
          if (Math.abs(current - below) > 30) horizontalLines++
        }
      }
    }
    
    return {
      verticalLines,
      horizontalLines,
      structure: verticalLines > horizontalLines ? 'corridor-like' : 'open-space'
    }
  }

  const calculateSafetyScore = (brightness, colors, patterns) => {
    let score = 100
    
    // Deduct points for dark environments
    if (brightness.status === 'dark') score -= 40
    else if (brightness.status === 'dim') score -= 20
    
    // Deduct points for indoor/corridor environments (potentially isolated)
    if (colors.environment === 'indoor/corridor') score -= 15
    
    // Add points for good structure visibility
    if (patterns.structure === 'corridor-like') score += 10
    
    return Math.max(0, Math.min(100, score))
  }

  const generateRecommendations = (brightness, colors, patterns) => {
    const recommendations = []
    
    if (brightness.status === 'dark') {
      recommendations.push('⚠️ Very dark area detected - consider using flashlight')
      recommendations.push('🚶 Walk with a companion if possible')
    } else if (brightness.status === 'dim') {
      recommendations.push('💡 Dim lighting - stay alert')
    }
    
    if (colors.environment === 'indoor/corridor') {
      recommendations.push('🏢 Indoor corridor detected - check for emergency exits')
    }
    
    if (patterns.structure === 'corridor-like') {
      recommendations.push('📏 Structured environment - good visibility')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Environment appears safe')
    }
    
    return recommendations
  }

  const handleScan = async () => {
    const imageData = captureImage()
    if (imageData) {
      const result = await analyzeImage(imageData)
      setAnalysisResult(result)
      setIsScanning(false)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    }
  }

  const handleRetake = () => {
    setAnalysisResult(null)
    setIsScanning(false)
  }

  const getSafetyColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSafetyIcon = (score) => {
    if (score >= 80) return <CheckCircle className="text-green-600" size={24} />
    if (score >= 60) return <AlertTriangle className="text-yellow-600" size={24} />
    return <AlertTriangle className="text-red-600" size={24} />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">AI Camera Scan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {!analysisResult ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Point your camera at the environment to analyze safety conditions
            </p>
            
            <div className="relative bg-gray-100 rounded-xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                width={320}
                height={240}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 320,
                  height: 240,
                  facingMode: "environment"
                }}
                onUserMediaError={(error) => {
                  setCameraError('Camera access denied or not available')
                }}
                className="w-full h-auto"
              />
              {cameraError && (
                <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
                  <p className="text-red-600 text-sm text-center p-4">
                    {cameraError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScan}
                disabled={isScanning || cameraError}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Scan Environment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getSafetyIcon(analysisResult.safetyScore)}
                <span className={`text-xl font-bold ${getSafetyColor(analysisResult.safetyScore)}`}>
                  Safety Score: {analysisResult.safetyScore}/100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Zap size={16} />
                  Environment Analysis
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Lighting:</strong> {analysisResult.brightness.description}</p>
                  <p><strong>Environment:</strong> {analysisResult.colors.environment}</p>
                  <p><strong>Structure:</strong> {analysisResult.patterns.structure}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Retake
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AICameraScan
