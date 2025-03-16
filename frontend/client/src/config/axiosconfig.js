import axios from "axios"

const axiosConfig = axios.create({
    baseURL: "http://localhost:3001",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})

axiosConfig.interceptors.request.use(
    (config) => {
        const Token = localStorage.getItem("token")
            if(Token) {
                config.headers.Authorization = `Bearer ${Token}`
            }
            return config
        },
    (error) => {
        return Promise.reject(error)
    }
)

export default axiosConfig