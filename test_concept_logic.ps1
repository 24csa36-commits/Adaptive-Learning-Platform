$ErrorActionPreference = "Stop"

$apiUrl = "http://localhost:8080/api/adaptive-quiz"

Write-Host "1. Starting Quiz Session with Java Video Transcript..."
$startPayload = @{
    userId = 1
    topic = "Java Concurrency & Multithreading"
    lessonContent = "Video Transcript: In Java, multithreading allows concurrent execution of two or more parts of a program for maximum utilization of CPU. Threads can be created by implementing the Runnable interface or extending the Thread class. Synchronization is essential to avoid race conditions. We can use the 'synchronized' block or concurrent locks like ReentrantLock to secure critical sections."
    initialScore = 50.0
} | ConvertTo-Json

$startRes = Invoke-RestMethod -Uri "$apiUrl/start" -Method Post -Body $startPayload -ContentType "application/json"
$sessionId = $startRes.sessionId
$q1 = $startRes.firstQuestion | ConvertFrom-Json

Write-Host "`n=== Q1 ==="
Write-Host "Text: $($q1.text)"
Write-Host "ConceptId: $($q1.conceptId)"

Write-Host "`n2. Submitting INCORRECT answer for Q1..."
$ans1Payload = @{
    previousQuestion = $startRes.firstQuestion
    userAnswer = "WRONG ANSWER"
    wasCorrect = $false
} | ConvertTo-Json

$ans1Res = Invoke-RestMethod -Uri "$apiUrl/$sessionId/answer" -Method Post -Body $ans1Payload -ContentType "application/json"
$q2 = $ans1Res.nextQuestion | ConvertFrom-Json

Write-Host "`n=== Q2 (After Failure) ==="
Write-Host "Text: $($q2.text)"
Write-Host "ConceptId: $($q2.conceptId)"

Write-Host "`n3. Submitting CORRECT answer for Q2..."
$ans2Payload = @{
    previousQuestion = $ans1Res.nextQuestion
    userAnswer = $q2.correctAnswer
    wasCorrect = $true
} | ConvertTo-Json

$ans2Res = Invoke-RestMethod -Uri "$apiUrl/$sessionId/answer" -Method Post -Body $ans2Payload -ContentType "application/json"
$q3 = $ans2Res.nextQuestion | ConvertFrom-Json

Write-Host "`n=== Q3 (After Success) ==="
Write-Host "Text: $($q3.text)"
Write-Host "ConceptId: $($q3.conceptId)"
