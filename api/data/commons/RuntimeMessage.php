<?php


class RuntimeMessage
{
    private ?string $message = null;
    private bool $error = true;
    private array $data = [];
    private int $code = 0;

    function __construct($message = null, $error = true, $data = [], $code = 0){
        if(is_array($message)){
            if(isset($message["message"])){
                $this->message = $message["message"];
            }
            if(isset($message["error"])){
                $this->error = $message["error"];
            }
            if(isset($message["data"])){
                $this->data = $message["data"];
            }
            if(isset($message["code"])){
                $this->code = $message["code"];
            }
        }
        else if(!is_object($message)){
            $this->message = $message;
            $this->error = $error;
            $this->data = $data;
            $this->code = $code;
        }
    }

    /**
     * @return mixed|string|null
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @param mixed|string|null $message
     */
    public function setMessage(?string $message, bool $cumule = false)
    {
        $this->message = $this->message ? $this->message."\n".$message : $message;
        return $this;
    }

    /**
     * @return bool|mixed
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * @param bool|mixed $error
     */
    public function setError(bool $error)
    {
        $this->error = $error;
        return $this;
    }

    /**
     * @return array|mixed
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param array|mixed $data
     */
    public function setData(array $data)
    {
        $this->data = $data;
        return $this;
    }

    /**
     * @return int|mixed
     */
    public function getCode(): int
    {
        return $this->code;
    }

    /**
     * @param int|mixed $code
     */
    public function setCode(int $code)
    {
        $this->code = $code;
        return $this;
    }

    static function closeHttpRequest(array $data){
        if(isset($data["message"])){
            $data["message"] = preg_replace("/\\n/", "<br>", $data["message"]);
        }
        die(json_encode($data, JSON_INVALID_UTF8_IGNORE));
    }

    static function closeHttpRequestIfNot($arg, array $data, string $message = null){
        if(is_bool($arg)){
            $arg = !$arg;
        }
        if(!$arg){
            if($message) {
                $data["message"] = $message;
            }
            die(json_encode($data, JSON_INVALID_UTF8_IGNORE));
        }
    }
}