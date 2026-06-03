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
        $mail->Username   = getenv('SMTP_EMAIL'); // Pulled from Vercel Envs
        $mail->Password   = getenv('SMTP_PASSWORD'); // Pulled from Vercel Envs
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom(getenv('SMTP_EMAIL'), 'Your App Name');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Your One-Time Password (OTP)';
        $mail->Body    = "Your verification code is: <b>" . htmlspecialchars($otp) . "</b>. It is valid for 5 minutes.";
        $mail->AltBody = "Your verification code is: " . $otp;

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'OTP sent successfully']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method']);
}
?>
