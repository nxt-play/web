<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Vercel installs composer packages one level up or relative to the api directory
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allows MIT App Inventor to access it safely
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $otp = filter_input(INPUT_POST, 'otp', FILTER_UNSAFE_RAW); // Sanitized via htmlspecialchars later

    if (!$email || !$otp) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or OTP']);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings using Environment Variables
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_EMAIL');
        $mail->Password   = getenv('SMTP_PASSWORD'); 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom(getenv('SMTP_EMAIL'), 'NXT Play Account Verification');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Verify your email address';

$mail->Body = '
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
    <h2>NXT Play</h2>

    <h3>Verify your email address</h3>

    <p>Welcome to NXT Play.</p>

    <p>To complete your sign-in and start streaming, please verify your email address using the code below:</p>

    <div style="font-size:36px;font-weight:bold;letter-spacing:4px;margin:20px 0;">
        '.htmlspecialchars($otp).'
    </div>

    <p>This verification code will expire in 5 minutes.</p>

    <p>If you didn't request this code, you can safely ignore this email.</p>

    <p>Happy streaming!<br><strong>The NXT Play Team</strong></p>

    <hr>

    <p style="font-size:12px;color:#666;">
        NXT Play — Movies, TV Shows, Anime & More<br>
        This is an automated message. Please do not reply to this email.
    </p>
</div>';

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'OTP sent successfully']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method']);
}
?>
