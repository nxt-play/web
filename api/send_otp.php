<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid Request Method'
    ]);
    exit;
}

$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$otp = filter_input(INPUT_POST, 'otp', FILTER_UNSAFE_RAW);

if (!$email || !$otp) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email or OTP'
    ]);
    exit;
}

$mail = new PHPMailer(true);

try {

    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('SMTP_EMAIL');
    $mail->Password   = getenv('SMTP_PASSWORD');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Sender & Recipient
    $mail->setFrom(getenv('SMTP_EMAIL'), 'NXT Play');
    $mail->addAddress($email);

    // Email Content
    $mail->isHTML(true);
    $mail->Subject = 'Verify your email address';

    $safeOtp = htmlspecialchars($otp, ENT_QUOTES, 'UTF-8');

    $mail->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>NXT Play Verification</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding:30px 15px;">

                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">

                        <tr>
                            <td style="background:#8505ff;color:#ffffff;padding:20px;text-align:center;">
                                <h1 style="margin:0;font-size:28px;">NXT Play</h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:40px;">

                                <h2 style="margin-top:0;color:#222;">
                                    Verify your email address
                                </h2>

                                <p style="font-size:16px;color:#555;line-height:1.6;">
                                    Welcome to NXT Play.
                                </p>

                                <p style="font-size:16px;color:#555;line-height:1.6;">
                                    To complete your sign-in and start streaming,
                                    please verify your email address using the code below:
                                </p>

                                <div style="
                                    margin:30px 0;
                                    text-align:center;
                                    font-size:42px;
                                    font-weight:bold;
                                    letter-spacing:8px;
                                    color:#8505ff;">
                                    '.$safeOtp.'
                                </div>

                                <p style="font-size:16px;color:#555;">
                                    This verification code will expire in 5 minutes.
                                </p>

                                <p style="font-size:16px;color:#555;">
                                    If you did not request this code, you can safely ignore this email.
                                </p>

                                <p style="font-size:16px;color:#555;margin-top:30px;">
                                    Happy streaming!
                                </p>

                                <p style="font-size:16px;color:#222;">
                                    <strong>The NXT Play Team</strong>
                                </p>

                            </td>
                        </tr>

                        <tr>
                            <td style="
                                background:#f8f8f8;
                                padding:20px;
                                text-align:center;
                                font-size:12px;
                                color:#777;">
                                NXT Play — Movies, TV Shows, Anime & More
                                <br><br>
                                This is an automated message. Please do not reply to this email.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>
    </body>
    </html>';

    $mail->AltBody =
        "NXT Play\n\n" .
        "Verify your email address\n\n" .
        "Your verification code is: $otp\n\n" .
        "This code expires in 5 minutes.\n\n" .
        "Happy streaming!\n" .
        "The NXT Play Team";

    $mail->send();

    echo json_encode([
        'status' => 'success',
        'message' => 'OTP sent successfully'
    ]);

} catch (Exception $e) {

    echo json_encode([
        'status' => 'error',
        'message' => 'Mailer Error: ' . $mail->ErrorInfo
    ]);

}
?>