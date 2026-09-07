import connectDB from './db';
import { Board, Column } from './models';

export async function initializeUserBoard(userId: string) {
    try {
        await connectDB();

        //Check if board exist
        const existingBoard = await Board.findOne({ userId, name: "Job Hunt" });

        if(existingBoard) {
            return existingBoard}

        // Create a new board for the user
        const board = await Board.create({ userId, name: "Job Hunt", columns: [] });

        //Create default columns
        const defaultColumns = [
            { name: "Wish List", order: 0 },
            { name: "Applied", order: 1 },
            { name: "Interviewing", order: 2 },
            { name: "Offer", order: 3 },
            { name: "Rejected", order: 4 }
        ];

        const columns = await Promise.all(defaultColumns.map( (col)=> {
            return Column.create({ name: col.name, order: col.order, boardId: board._id, jobApplications: [] });
        }));

        //Update board with columns id
        board.columns = columns.map((col) => col._id);
        await board.save();

        return board;
    } catch (error) {
        throw error;
    }
}
