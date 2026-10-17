<?php

function post(string $url, array $data): string
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);

        throw new Exception($error);
    }

    curl_close($ch);

    return $response;
}

$pageurl = "https://turnstile.zeroclover.io/";
$sitekey = "0x4AAAAAAAEwzhD6pyKkgXC0";

$data = ["method" => "turnstile", "url" => $pageurl, "sitekey" => $sitekey];
$r = post("http://localhost:5000/in", $data);
print_r($r);
exit;
$pageurl = "https://2captcha.com/demo/recaptcha-v3";
$sitekey = "6LfB5_IbAAAAAMCtsjEHEHKqcB9iQocwwxTiihJu";
$data = ["url" => $pageurl, "sitekey" => $sitekey];
$r = post("http://localhost:3010/recaptchaV3", $data);
print_r($r);
?>