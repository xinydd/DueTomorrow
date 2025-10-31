import { useState, useRef, useEffect } from 'react'
import { Camera, X, AlertTriangle, CheckCircle, Loader2, Eye, Zap, Smartphone } from 'lucide-react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'

const AICameraScanMobile = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [opencvLoaded, setOpencvLoaded] = useState(false)
  const webcamRef = useRef(null)
  const [model, setModel] = useState(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }
    checkMobile()
  }, [])

  // Load OpenCV.js for enhanced image processing
  useEffect(() => {
    const loadOpenCV = () => {
      if (window.cv) {
        setOpencvLoaded(true)
        return
      }

      // Load OpenCV.js dynamically
      const script = document.createElement('script')
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
      script.onload = () => {
        window.cv['onRuntimeInitialized'] = () => {
          console.log('OpenCV.js loaded successfully')
          setOpencvLoaded(true)
        }
      }
      script.onerror = () => {
        console.log('OpenCV.js failed to load, using fallback')
        setOpencvLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadOpenCV()
  }, [])

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

  const analyzeImageWithOpenCV = async (imageData) => {
    if (!opencvLoaded || !window.cv) {
      return analyzeImageFallback(imageData)
    }

    try {
      setIsScanning(true)
      
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          try {
            // Create canvas for OpenCV processing
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            // Convert to OpenCV Mat
            const src = window.cv.imread(canvas)
            
            // Convert to grayscale for analysis
            const gray = new window.cv.Mat()
            window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY)
            
            // Analyze brightness using OpenCV
            const brightness = analyzeBrightnessOpenCV(gray)
            
            // Analyze edges for structure detection
            const edges = new window.cv.Mat()
            window.cv.Canny(gray, edges, 50, 150)
            const structure = analyzeStructureOpenCV(edges)
            
            // Analyze contours for environment detection
            const contours = new window.cv.MatVector()
            const hierarchy = new window.cv.Mat()
            window.cv.findContours(edges, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE)
            const environment = analyzeEnvironmentOpenCV(contours, src.rows, src.cols)
            
            // Clean up OpenCV objects
            src.delete()
            gray.delete()
            edges.delete()
            contours.delete()
            hierarchy.delete()
            
            // Combine analysis results
            const result = {
              brightness: brightness,
              structure: structure,
              environment: environment,
              safetyScore: calculateSafetyScore(brightness, environment, structure),
              recommendations: generateRecommendations(brightness, environment, structure),
              timestamp: new Date().toISOString(),
              method: 'OpenCV.js'
            }
            
            resolve(result)
          } catch (error) {
            console.error('OpenCV analysis error:', error)
            resolve(analyzeImageFallback(imageData))
          }
        }
        
        img.src = imageData
      })
    } catch (error) {
      console.error('Error in OpenCV analysis:', error)
      return analyzeImageFallback(imageData)
    }
  }

  const analyzeImageFallback = async (imageData) => {
    try {
      setIsScanning(true)
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            const brightness = analyzeBrightness(imageData)
            const colorAnalysis = analyzeColors(imageData)
            const patternAnalysis = analyzePatterns(imageData)
            
            const result = {
              brightness: brightness,
              colors: colorAnalysis,
              patterns: patternAnalysis,
              safetyScore: calculateSafetyScore(brightness, colorAnalysis, patternAnalysis),
              recommendations: generateRecommendations(brightness, colorAnalysis, patternAnalysis),
              timestamp: new Date().toISOString(),
              method: 'Canvas API'
            }
            
            resolve(result)
          } catch (error) {
            console.error('Fallback analysis error:', error)
            resolve({
              error: 'Analysis failed',
              safetyScore: 50,
              recommendations: ['Unable to analyze environment. Please ensure good lighting.'],
              method: 'Error'
            })
          }
        }
        
        img.src = imageData
      })
    } catch (error) {
      console.error('Error in fallback analysis:', error)
      return {
        error: 'Analysis failed',
        safetyScore: 50,
        recommendations: ['Unable to analyze environment. Please try again.'],
        method: 'Error'
      }
    }
  }

  // OpenCV-based brightness analysis
  const analyzeBrightnessOpenCV = (grayMat) => {
    const mean = window.cv.mean(grayMat)
    const brightness = (mean[0] / 255) * 100
    
    return {
      level: brightness,
      status: brightness < 30 ? 'dark' : brightness < 60 ? 'dim' : 'bright',
      description: brightness < 30 ? 'Very dark environment detected' : 
                   brightness < 60 ? 'Dim lighting detected' : 'Good lighting'
    }
  }

  // OpenCV-based structure analysis
  const analyzeStructureOpenCV = (edgesMat) => {
    // Count edge pixels to determine structure complexity
    const edgeCount = edgesMat.total()
    const totalPixels = edgesMat.rows * edgesMat.cols
    const edgeRatio = edgeCount / totalPixels
    
    return {
      edgeRatio: edgeRatio,
      complexity: edgeRatio > 0.1 ? 'high' : edgeRatio > 0.05 ? 'medium' : 'low',
      structure: edgeRatio > 0.1 ? 'corridor-like' : 'open-space'
    }
  }

  // OpenCV-based environment analysis
  const analyzeEnvironmentOpenCV = (contours, height, width) => {
    const totalArea = height * width
    let indoorIndicators = 0
    let outdoorIndicators = 0
    
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i)
      const area = window.cv.contourArea(contour)
      const areaRatio = area / totalArea
      
      // Large rectangular areas suggest indoor spaces
      if (areaRatio > 0.1) {
        const rect = window.cv.boundingRect(contour)
        const aspectRatio = rect.width / rect.height
        
        if (aspectRatio > 2 || aspectRatio < 0.5) {
          indoorIndicators++
        } else {
          outdoorIndicators++
        }
      }
    }
    
    return {
      indoorIndicators,
      outdoorIndicators,
      environment: indoorIndicators > outdoorIndicators ? 'indoor/corridor' : 'outdoor'
    }
  }

  // Fallback analysis methods (same as before)
  const analyzeBrightness = (imageData) => {
    const data = imageData.data
    let totalBrightness = 0
    let pixelCount = 0
    
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
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
    
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
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
    
    let verticalLines = 0
    let horizontalLines = 0
    
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const index = (y * width + x) * 4
        
        if (index < data.length - 4) {
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

  const calculateSafetyScore = (brightness, environment, structure) => {
    let score = 100
    
    if (brightness.status === 'dark') score -= 40
    else if (brightness.status === 'dim') score -= 20
    
    if (environment.environment === 'indoor/corridor') score -= 15
    
    if (structure.structure === 'corridor-like') score += 10
    
    return Math.max(0, Math.min(100, score))
  }

  const generateRecommendations = (brightness, environment, structure) => {
    const recommendations = []
    
    if (brightness.status === 'dark') {
      recommendations.push('⚠️ Very dark area detected - consider using flashlight')
      recommendations.push('🚶 Walk with a companion if possible')
    } else if (brightness.status === 'dim') {
      recommendations.push('💡 Dim lighting - stay alert')
    }
    
    if (environment.environment === 'indoor/corridor') {
      recommendations.push('🏢 Indoor corridor detected - check for emergency exits')
    }
    
    if (structure.structure === 'corridor-like') {
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
      const result = await analyzeImageWithOpenCV(imageData)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Camera Scan</h3>
              {isMobile && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Smartphone size={12} />
                  Mobile Optimized
                </div>
              )}
            </div>
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
            
            {/* Processing Method Indicator */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Zap size={16} />
                <span>
                  {opencvLoaded ? 'OpenCV.js Processing' : 'Canvas API Processing'}
                </span>
              </div>
            </div>
            
            <div className="relative bg-gray-100 rounded-xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                width={isMobile ? 280 : 320}
                height={isMobile ? 210 : 240}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: isMobile ? 280 : 320,
                  height: isMobile ? 210 : 240,
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
              <div className="text-xs text-gray-500">
                Processed with: {analysisResult.method}
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
                  <p><strong>Environment:</strong> {analysisResult.environment?.environment || analysisResult.colors?.environment}</p>
                  <p><strong>Structure:</strong> {analysisResult.structure?.structure || analysisResult.patterns?.structure}</p>
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

export default AICameraScanMobile
