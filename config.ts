type ConfigProfile = {
    name: string
    shardCount: number
    embedColor?: string
}

const profiles: ConfigProfile[] = [
    {
        name: "production",
        shardCount: 1
    }
]

export default profiles[Number(process.argv[2])]