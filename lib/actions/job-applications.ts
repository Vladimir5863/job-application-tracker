"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

interface JobApplicationData {
    company: string;
    position: string;
    location?: string;
    salary?: number;
    jobUrl?: string;
    tags?: string[];
    description?: string;
    notes?: string;
    columnId: string;
    boardId: string;
}

export async function createJobApplication(data: JobApplicationData) {
    const session = await getSession();
    if(!session?.user){
        return{error: "User not authenticated"};
    }
    await connectDB();

    const{company, position, location, salary, jobUrl, tags, description, notes, columnId, boardId} = data;

    if(!company || !position || !columnId || !boardId){
        return {error: "Missing required fields"};
    }

    //Verify board ownership
    const board = await Board.findOne({_id: boardId, userId: session.user.id});
    if(!board){
        return {error: "Board not found or user not authorized"};
    }

    //Verify column ownership
    const column = await Column.findOne({_id: columnId, boardId: board._id});
    if(!column){
        return {error: "Column not found or user not authorized"};
    }

    const maxOrder = (await JobApplication.findOne({ columnId }).sort({order: -1}).select("order").lean()) as {order: number} | null;

    const jobApplication = await JobApplication.create({
        company,
        position,
        location,
        notes,
        salary,
        userId: session.user.id,
        columnId: column._id,
        boardId: board._id,
        tags: tags || [],
        description,
        status: "applied",
        order: maxOrder ? maxOrder.order + 1 : 0,
    });

    //Add job application to column
    await Column.findByIdAndUpdate(column._id, {$push: {jobApplications: jobApplication._id}});

    revalidatePath("/dashboard");

    return {data: JSON.parse(JSON.stringify(jobApplication))};
}
