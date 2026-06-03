<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'path/to/PHPMailer/src/Exception.php';
require 'path/to/PHPMailer/src/PHPMailer.php';
require 'path/to/PHPMailer/src/SMTP.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the email and OTP sent from MIT App Inventor
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $otp = filter_input(INPUT_POST, 'otp', FILTER_SANITIZE_STRING);

    if (!$email || !$otp) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or OTP']);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Replace with your SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com'; // Your email
        $mail->Password   = 'your-app-password';   // Your email app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('your-email@gmail.com', 'Your App Name');
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
