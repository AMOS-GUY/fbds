<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration for QQ Mail
$config = [
    'smtp_host' => 'smtp.qq.com',      // For QQ Mail
    'smtp_port' => 587,                 // TLS port
    'smtp_secure' => 'tls',
    'smtp_user' => 'guyamos28@qq.com', // Your QQ email
    'smtp_pass' => 'heicrpwsbehhcebe' // QQ Mail SMTP password (not your login password)
];

// Alternative for Outlook
// $config = [
//     'smtp_host' => 'smtp.office365.com',
//     'smtp_port' => 587,
//     'smtp_secure' => 'tls',
//     'smtp_user' => 'your-email@outlook.com',
//     'smtp_pass' => 'your-password'
// ];

function sendEmail($to, $subject, $message, $isHtml = true) {
    global $config;
    
    require_once 'PHPMailer/PHPMailer.php';
    require_once 'PHPMailer/SMTP.php';
    require_once 'PHPMailer/Exception.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_user'];
        $mail->Password = $config['smtp_pass'];
        $mail->SMTPSecure = $config['smtp_secure'];
        $mail->Port = $config['smtp_port'];
        
        $mail->setFrom($config['smtp_user'], 'Horizon Store');
        $mail->addAddress($to);
        
        $mail->isHTML($isHtml);
        $mail->Subject = $subject;
        $mail->Body = $message;
        $mail->AltBody = strip_tags($message);
        
        $mail->send();
        return ['success' => true, 'message' => 'Email sent successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => $mail->ErrorInfo];
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    if ($action === 'send_verification') {
        $email = $data['email'];
        $code = rand(100000, 999999);
        $expires = time() + 600; // 10 minutes
        
        // Store verification code
        session_start();
        $_SESSION['verification_code'] = $code;
        $_SESSION['verification_email'] = $email;
        $_SESSION['verification_expires'] = $expires;
        
        $message = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #8dd2e9; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .code { font-size: 32px; font-weight: bold; color: #8dd2e9; text-align: center; padding: 20px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Horizon Store - Email Verification</h2>
                    </div>
                    <div class='content'>
                        <p>Hello,</p>
                        <p>Thank you for registering with Horizon Store! Please use the verification code below to complete your registration:</p>
                        <div class='code'>$code</div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2026 Horizon Store. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        
        $result = sendEmail($email, 'Verify Your Email - Horizon Store', $message, true);
        echo json_encode($result);
    } 
    elseif ($action === 'verify_code') {
        session_start();
        $code = $data['code'];
        
        if (isset($_SESSION['verification_code']) && 
            $_SESSION['verification_code'] == $code && 
            time() < $_SESSION['verification_expires']) {
            echo json_encode(['success' => true, 'message' => 'Code verified successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired code']);
        }
    }
}
?>

<!-- heicrpwsbehhcebe -->